export function getAvailableModels(apiKey: string): Promise<string[]> {
  return new Promise(async (resolve, reject) => {
    const models = [
      "Qwen/Qwen2-72B-Instruct",
      // "meta-llama/Meta-Llama-3-70B-Instruct", — N completions is broken, get fragments or no response at all.
      // "mistralai/Mixtral-8x22B-Instruct-v0.1", — Keep getting 'network error'
      "NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO",
    ];

    resolve(models);
  });
}

export function getAvailableChatModels(apiKey: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    getAvailableModels(apiKey)
      .then((models) => {
        resolve(models);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
