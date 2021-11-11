import type { ElementHandle, Queries } from "playwright-testing-library/dist/typedefs";
import { queries } from "playwright-testing-library";

export default class TestingLibraryContext {
    async getDocument(): Promise<null | ElementHandle> { return null; }
    queries: Queries = queries
}
