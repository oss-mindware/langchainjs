import { Tool } from "@langchain/core/tools";
import { getEnvironmentVariable } from "@langchain/core/utils/env";

export interface MindwareParams {
  apiKey?: string;
  maxActions?: number;
  maxServices?: number;
}

export class Mindware extends Tool {
  static lc_name() {
    return "Mindware";
  }

  toJSON() {
    return this.toJSONNotImplemented();
  }

  protected apiKey: string;
  protected maxActions: number | undefined;
  protected maxServices: number | undefined;

  constructor(params: MindwareParams = {}) {
    super();

    const apiKey = params.apiKey ?? getEnvironmentVariable("MINDWARE_API_KEY");

    if (!apiKey) {
      throw new Error(
        "Mindware API key not set. You can set it as MINDWARE_API_KEY in your .env file, or pass it to Mindware."
      );
    }

    this.apiKey = apiKey;
    this.maxActions = params.maxActions;
    this.maxServices = params.maxServices;
  }

  name = "mindware";

  /** @ignore */
  async _call(input: string) {
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input,
        maxActions: this.maxActions,
        maxServices: this.maxServices,
      }),
    };

    const res = await fetch("https://api.mindware.co/api/v1/relay", options);

    if (!res.ok) {
      throw new Error(
        `Got ${res.status} error from Mindware: ${res.statusText}`
      );
    }

    const json = await res.json();

    if (json.response) {
      return json.response;
    }

    return "No response received from Mindware";
  }

  description =
    "A tool that intelligently accesses external data sources and functionalities without the need for complex integrations.";
}
