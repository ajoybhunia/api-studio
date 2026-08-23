import { beforeEach, describe, expect, it } from "vitest";
import { useRequestStore } from "./requestStore";

describe("useRequestStore", () => {
  beforeEach(() => {
    useRequestStore.setState({
      openTabs: [],
      activeTabId: null,
      requests: {},
    });
  });

  describe("createRequest", () => {
    it("generates a unique ID", () => {
      const id1 = useRequestStore.getState().createRequest();
      const id2 = useRequestStore.getState().createRequest();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it("creates request with default values", () => {
      const id = useRequestStore.getState().createRequest();
      const request = useRequestStore.getState().requests[id];
      expect(request).toBeDefined();
      expect(request.method).toBe("GET");
      expect(request.url).toBe("");
      expect(request.name).toBe("Untitled Request");
    });

    it("opens a tab for the new request", () => {
      const id = useRequestStore.getState().createRequest();
      const { openTabs, activeTabId } = useRequestStore.getState();
      expect(openTabs).toHaveLength(1);
      expect(openTabs[0].id).toBe(id);
      expect(activeTabId).toBe(id);
    });
  });

  describe("updateRequest", () => {
    it("updates method", () => {
      const id = useRequestStore.getState().createRequest();
      useRequestStore.getState().updateRequest(id, { method: "POST" });
      const request = useRequestStore.getState().requests[id];
      expect(request.method).toBe("POST");
    });

    it("updates url", () => {
      const id = useRequestStore.getState().createRequest();
      useRequestStore
        .getState()
        .updateRequest(id, { url: "https://api.example.com" });
      const request = useRequestStore.getState().requests[id];
      expect(request.url).toBe("https://api.example.com");
    });

    it("does not modify id", () => {
      const id = useRequestStore.getState().createRequest();
      const originalId = useRequestStore.getState().getRequest(id)?.id;
      useRequestStore.getState().updateRequest(id, { name: "New Name" });
      expect(useRequestStore.getState().getRequest(id)?.id).toBe(originalId);
    });
  });

  describe("getRequest", () => {
    it("returns request for valid ID", () => {
      const id = useRequestStore.getState().createRequest();
      const request = useRequestStore.getState().getRequest(id);
      expect(request).toBeDefined();
      expect(request?.id).toBe(id);
    });

    it("returns undefined for non-existent ID", () => {
      const request = useRequestStore.getState().getRequest("non-existent");
      expect(request).toBeUndefined();
    });
  });

  describe("deleteRequest", () => {
    it("removes request data", () => {
      const id = useRequestStore.getState().createRequest();
      useRequestStore.getState().deleteRequest(id);
      const request = useRequestStore.getState().requests[id];
      expect(request).toBeUndefined();
    });
  });

  describe("tab management", () => {
    it("closeTab removes tab and updates activeTabId", () => {
      const id1 = useRequestStore.getState().createRequest();
      const id2 = useRequestStore.getState().createRequest();
      useRequestStore.getState().closeTab(id2);
      const { openTabs, activeTabId } = useRequestStore.getState();
      expect(openTabs).toHaveLength(1);
      expect(openTabs[0].id).toBe(id1);
      expect(activeTabId).toBe(id1);
    });

    it("closeTab sets activeTabId to null when no tabs remain", () => {
      const id = useRequestStore.getState().createRequest();
      useRequestStore.getState().closeTab(id);
      expect(useRequestStore.getState().activeTabId).toBeNull();
    });
  });
});
