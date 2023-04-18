import {
  ChatCompletionRequestMessage,
  CreateCompletionResponse,
  OpenAI,
} from "openai-streams";

export interface SearchResult {
  /** The hostname of the website. (i.e. "google.com") */
  hostname: string;
  /** The URL of the result. */
  url: string;
  /** The title of the result. */
  title: string;
  /**
   * The sanitized description of the result.
   * Bold tags will still be present in this string.
   */
  description: string;
  /** The description of the result. */
  rawDescription: string;
  /** The icon of the website. */
  icon: string;
  /** The ddg!bang information of the website, if any. */
  bang?: string;
}

export const browseDuck = async (
  messages: ChatCompletionRequestMessage[],
  count: number,
  apiKey: string
): Promise<ChatCompletionRequestMessage[]> => {
  /*//////////////////////////////////////////////////////////////////////////////////////////
    STEPS:
    1. Retrieve all message content from messagesFromLineage (excluding system messages).
    2. Use OpenAI's completion to generate a rephrased version of the current question.
    3. Scrape search results from DuckDuckGo for the rephrased question.
    4. Compile the search results and add them as a system message, along with the original 'messagesFromLineage'.
  //////////////////////////////////////////////////////////////////////////////////////////*/

  // Extract all chat messages (exclude system messages)
  const allChatMessages = messages
    .slice(1, -1)
    .filter((_) => _?.role != "system")
    .map((_) => _?.content)
    .join("\n");

  let latestChatMessage = messages.slice(-1)[0];

  // Prompt template to generate a rephrased question
  const toRephraseString = `
      {
        "previous_questions": [
          ${allChatMessages}
        ],
        "question": ${latestChatMessage?.content},
      }
      rephrased_question_with_context:
      `;

  const stream = await OpenAI(
    "completions",
    {
      model: "text-davinci-003",
      temperature: 0,
      prompt: toRephraseString.trim(),
      max_tokens: 1000,
    },
    { apiKey: apiKey!, mode: "raw" }
  );

  // Get the openai completion stream results
  let rephrasedQuestion = await new Response(stream).text();

  // Rephrased question
  rephrasedQuestion = JSON.parse(`[${rephrasedQuestion.split(`}{`).join(`},{`)}]`)
    .map((chunk: CreateCompletionResponse) => chunk?.choices[0]?.text)
    .join("")
    .trim();

  //  Get DuckDuckGo scraped search results for the rephrased question.
  const searchResults = await fetch(`/api/ddg`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: rephrasedQuestion, count }),
  }).then((res) => res.json());

  // Create a system message using the search results
  // Todo : test out different formatting styles for this template
  let searchContext = {
    role: "system",
    content: `Knowledge base for the question '${latestChatMessage?.content}'.
You don't need it. But you can use if required:
${"```"}
${searchResults.map((_: SearchResult) => _?.description).join("\n")}
${"```"}`,
  };

  // Final prompt
  // [ messagesFromLineage + searchContext message ]
  let messagesWithSearchResultsContext = [searchContext, ...messages];

  console.table(messagesWithSearchResultsContext);

  return messagesWithSearchResultsContext as ChatCompletionRequestMessage[];
};
