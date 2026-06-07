(() => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";

  function init() {
    const root = document.querySelector("#search");
    if (!root || !window.PagefindUI) return;

    const ui = new window.PagefindUI({
      element: "#search",
      showSubResults: true,
      resetStyles: false,
      translations: {
        placeholder: "输入关键词搜索笔记",
        clear_search: "清空",
        load_more: "加载更多",
        search_label: "搜索本站"
      }
    });

    if (query) {
      const input = root.querySelector("input[type='text'], input[type='search']");
      if (input) {
        input.value = query;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    return ui;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
