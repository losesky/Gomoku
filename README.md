# 五子棋大师 (Gomoku Master)

## 简介

这是一个基于 HTML5 Canvas 和 JavaScript 实现的经典五子棋游戏。它具有一个响应式的用户界面，支持人机对战和人人对战模式。AI 对手具有多个难度级别，并使用了如 Minimax 算法、Alpha-Beta 剪枝和棋型识别等高级技术来提供具有挑战性的游戏体验。

## 特性

*   **响应式设计:** 棋盘和 UI 元素可以自适应不同的屏幕尺寸，提供一致的游戏体验。
*   **人机对战:** 与具有不同难度级别的 AI 对手对战。
*   **人人对战:** 在同一设备上与朋友或家人对战。
*   **可定制的游戏设置:**
    *   选择总局数（3局2胜、5局3胜等）。
    *   选择 AI 难度（简单、中等、困难）。
    *   启用或禁用 AI 对战模式。
*   **高级 AI:**
    *   使用 **Minimax 算法**和 **Alpha-Beta 剪枝**进行高效的决策。
    *   **棋型识别:** AI 能够识别并利用常见的五子棋棋型（如活四、冲四、活三等）。
    *   **动态评估:** 棋盘评估函数会根据游戏阶段动态调整策略。
    *   **AI 认输:** 在极端不利的情况下，AI 可能会选择认输。
*   **动画效果:** 棋子落子时具有平滑的动画效果。
*   **高亮显示:** 获胜的棋子会被高亮显示。
*   **比分跟踪:** 游戏会跟踪并显示每局的比分。
*   **清晰的 UI:** 简洁的状态面板显示当前玩家、比分和游戏状态。
*   **模态框:** 游戏结束时会显示一个模态框，显示获胜者和比分信息。

## 技术细节

*   **前端:** HTML5 Canvas, CSS3, JavaScript (ES6+)
*   **AI 算法:**
    *   Minimax with Alpha-Beta Pruning
    *   Pattern Recognition (e.g., "Five-in-a-row", "Open Four", "Blocked Four", "Open Three")
    *   Heuristic Board Evaluation (dynamic weighting based on game phase)

## 如何开始

1.  **克隆仓库:**
    ```bash
    git clone git@github.com:losesky/Gomoku.git
    ```
2.  **打开 `Gomoku.html`:** 在浏览器中打开 `Gomoku.html` 文件即可开始游戏。

## 游戏截图
<!-- 在这里添加游戏截图 -->

## 贡献

欢迎提交错误报告、功能请求或代码贡献。请通过 GitHub 的 Issues 或 Pull Requests 与我们联系。

## 许可证

本项目采用 MIT 许可证。有关详细信息，请参阅 [LICENSE](LICENSE) 文件。
