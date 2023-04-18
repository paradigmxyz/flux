import express from "express";
import needle from "needle";

const app = express();
app.use(express.json());
app.use(express.urlencoded());
const port = 3000;

const VQD_REGEX = /vqd='(\d+-\d+(?:-\d+)?)'/;
const SEARCH_REGEX = /DDG\.pageLayout\.load\('d',(\[.+\])\);DDG\.duckbar\.load\('images'/;

function queryString(query) {
  return new URLSearchParams(query).toString();
}

async function getVQD(query, ia = "web", options) {
  try {
    const response = await needle(
      `https://duckduckgo.com?${queryString({ q: query, ia })}`,
      options
    );
    let vqd = VQD_REGEX.exec(response.body)[1];
    return vqd;
  } catch (e) {
    throw new Error(`Failed to get the VQD for query "${query}". ${e}`);
  }
}

async function getSearches(query, vqd) {
  const queryObject = {
    q: query,
    kl: "wt-wt",
    dl: "en",
    ct: "US",
    vqd,
    sp: "1",
    bpa: "1",
    biaexp: "b",
    msvrtexp: "b",
    nadse: "b",
    eclsexp: "b",
    tjsexp: "b",
  };

  const response = await needle(
    "get",
    `https://links.duckduckgo.com/d.js?${queryString(queryObject)}`
  );

  if (response.body.includes("DDG.deep.is506"))
    throw new Error("A server error occurred!");

  const searchResults = JSON.parse(
    SEARCH_REGEX.exec(response.body)[1].replace(/\t/g, "    ")
  );

  // check for no results
  if (searchResults.length === 1 && !("n" in searchResults[0])) {
    const onlyResult = searchResults[0];
    /* istanbul ignore next */
    if (
      (!onlyResult.da && onlyResult.t === "EOF") ||
      !onlyResult.a ||
      onlyResult.d === "google.com search"
    )
      return {
        noResults: true,
        vqd,
        results: [],
      };
  }

  let results = [];

  // Populate search results
  for (const search of searchResults) {
    if ("n" in search) continue;
    let bang;
    if (search.b) {
      const [prefix, title, domain] = search.b.split("\t");
      bang = { prefix, title, domain };
    }
    results.push({
      title: search.t,
      description: search.a,
      rawDescription: search.a,
      hostname: search.i,
      icon: `https://external-content.duckduckgo.com/ip3/${search.i}.ico`,
      url: search.u,
      bang,
    });
  }

  return results;
}

app.post("/ddg", async (req, res) => {
  const { query = "ufc 287", count = 3 } = req.body;
  const vqd = await getVQD(query);
  const sr = await getSearches(query, vqd);
  res.json(sr.slice(0, count));
});

app.get("/", (req, res) => {
  res.send("hey!");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
