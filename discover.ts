import pl from "nodejs-polars";

const df = pl.readJSON("./extracted-data-example.json");

const authorsResult = df
  .explode("authors")
  .dropNulls("authors")
  .groupBy("authors")
  .len()
  .sort("authors_count", true);

const publisherResult = df
  .dropNulls("publisher")
  .groupBy("publisher")
  .len()
  .sort("publisher_count", true);

const authorRef = "Rezende, Aldo";

const aldoResendeArtifacts = df
  .explode("authors")
  .filter(pl.col("authors").eq(pl.lit(authorRef)))
  .select("title", "publisher", pl.col("date").alias("year"))
  .sort("year", true);

console.debug(df.head());
console.debug(publisherResult.head(10));
console.debug(authorsResult.head(10));
console.debug(aldoResendeArtifacts);
