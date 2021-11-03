import type { ElementHandle, Queries } from "playwright-testing-library/dist/typedefs";
import { queries } from "playwright-testing-library";

export default class TestingLibraryContext {
    document: null | ElementHandle = null
    queries: Queries = queries
}
