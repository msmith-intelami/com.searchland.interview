import { injectable } from "inversify";
import { getElasticsearchClient } from "../clients/elasticsearchClient.js";

type ElasticsearchHit<TDocument> = {
  _source?: TDocument;
};

type ElasticsearchSearchResponse<TDocument> = {
  hits?: {
    hits?: Array<ElasticsearchHit<TDocument>>;
  };
};

@injectable()
export class ElasticsearchService {
  private ensuredIndices = new Set<string>();

  public isEnabled() {
    return Boolean(getElasticsearchClient());
  }

  public async ensureIndex(indexName: string, mappings: object) {
    if (!this.isEnabled() || this.ensuredIndices.has(indexName)) {
      return;
    }

    const client = getElasticsearchClient();

    if (!client) {
      return;
    }

    const created = await client.indices
      .create({
        index: indexName,
        mappings,
      })
      .catch((error: unknown) => {
        console.error("Elasticsearch index creation failed", error);
        return null;
      });

    if (created) {
      this.ensuredIndices.add(indexName);
      return;
    }

    const exists = await client.indices.exists({ index: indexName }).catch((error: unknown) => {
      console.error("Elasticsearch index existence check failed", error);
      return false;
    });

    if (exists) {
      this.ensuredIndices.add(indexName);
    }
  }

  public async indexDocument(indexName: string, id: string, mappings: object, document: object) {
    await this.ensureIndex(indexName, mappings);

    if (!this.ensuredIndices.has(indexName)) {
      return false;
    }

    const client = getElasticsearchClient();

    if (!client) {
      return false;
    }

    const response = await client
      .index({
        index: indexName,
        id,
        document,
      })
      .catch((error: unknown) => {
        console.error("Elasticsearch index document failed", error);
        return null;
      });

    return Boolean(response);
  }

  public async deleteDocument(indexName: string, id: string) {
    const client = getElasticsearchClient();

    if (!client) {
      return false;
    }

    const response = await client.delete({ index: indexName, id }).catch((error: unknown) => {
      if (this.isNotFoundError(error)) {
        return { result: "not_found" };
      }

      console.error("Elasticsearch delete failed", error);
      return null;
    });

    if (response) {
      return true;
    }

    return false;
  }

  public async searchDocuments<TDocument>(indexName: string, mappings: object, body: object) {
    if (!this.isEnabled()) {
      return null;
    }

    await this.ensureIndex(indexName, mappings);

    if (!this.ensuredIndices.has(indexName)) {
      return null;
    }

    const client = getElasticsearchClient();

    if (!client) {
      return null;
    }

    const response = await client
      .search<TDocument>({
        index: indexName,
        ...(body as Record<string, unknown>),
      })
      .catch((error: unknown) => {
        console.error("Elasticsearch search failed", error);
        return null;
      });

    if (!response) {
      return null;
    }

    return (response.hits.hits ?? [])
      .map((hit) => hit._source)
      .filter((document): document is TDocument => Boolean(document));
  }

  private isNotFoundError(error: unknown) {
    return (
      typeof error === "object" &&
      error !== null &&
      "meta" in error &&
      typeof error.meta === "object" &&
      error.meta !== null &&
      "statusCode" in error.meta &&
      error.meta.statusCode === 404
    );
  }
}

export const elasticsearchService = new ElasticsearchService();
