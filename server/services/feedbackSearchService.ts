import { injectable } from "inversify";
import { elasticsearchService } from "./elasticsearchService.js";

const feedbackSearchIndex = process.env.ELASTICSEARCH_FEEDBACK_INDEX ?? "feedback";

export type FeedbackSearchDocument = {
  id: number;
  author: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const feedbackSearchMappings = {
  properties: {
    id: { type: "integer" },
    author: {
      type: "text",
      fields: {
        keyword: { type: "keyword" },
      },
    },
    email: { type: "keyword" },
    message: { type: "text" },
    status: { type: "keyword" },
    createdAt: { type: "date" },
    updatedAt: { type: "date" },
  },
};

@injectable()
export class FeedbackSearchService {
  public async index(document: FeedbackSearchDocument) {
    await elasticsearchService.indexDocument(
      feedbackSearchIndex,
      String(document.id),
      feedbackSearchMappings,
      document,
    );
  }

  public async delete(id: number) {
    await elasticsearchService.deleteDocument(feedbackSearchIndex, String(id));
  }

  public async search(query: string) {
    return elasticsearchService.searchDocuments<FeedbackSearchDocument>(feedbackSearchIndex, feedbackSearchMappings, {
      size: 50,
      sort: [{ createdAt: { order: "desc" } }],
      query: {
        multi_match: {
          query,
          fields: ["author^3", "email^2", "message", "status"],
          fuzziness: "AUTO",
        },
      },
    });
  }
}

export const feedbackSearchService = new FeedbackSearchService();
