# 可用级别交付计划

> 归档说明：这是一份历史阶段计划，只保留过程记录价值。当前真相源请优先看 `README.md`、`docs/completion-status.md`、`docs/remaining-tasks.md`。

## 本轮目标

把 Harness Loop 从“本地框架已成型”推进到“对外可用基线成立”。

这里的“可用基线”指的是：

- 核心框架可跑
- 安装、卸载、重装路径清楚
- 宿主验收有明确执行手册
- Claude 分发策略定版
- 异常输入测试覆盖关键坏路径

## 团队架构

### 1. 总控团队

职责：

- 定义本轮可用级别标准
- 维护 harness contract
- 分发任务包
- 做最终验收

### 2. 评估团队

职责：

- 识别真实宿主验证缺口
- 产出 smoke test 执行手册
- 定义“通过”和“未通过”的证据标准

### 3. 标准团队

职责：

- 把安装、卸载、重装、分发策略写成清晰文档
- 统一 README、规范文档、状态文档口径
- 确保“别人第一次接手也知道该怎么做”

### 4. 执行团队

职责：

- 补异常输入测试
- 补必要的文档与脚本
- 把缺口从“知道问题”推进到“仓库内可执行”

## 任务包总览

任务编号：PKG-01  
任务目标：固化可用级别标准、团队结构与任务包真相源  
负责人智能体：总控团队  
协作智能体：标准团队  
依赖任务：无  
变更文件范围：`docs/delivery-plan.md`、`docs/remaining-tasks.md`、`.harness/state/current/contract.json`  
TDD 步骤：先定义可用级别；再定义团队与任务包；再把 acceptance 写回 contract  
验收命令：`sed -n '1,260p' docs/delivery-plan.md && sed -n '1,260p' docs/remaining-tasks.md`  
验收标准：可用级别定义清楚，任务包边界清楚，团队职责清楚

任务编号：PKG-02  
任务目标：产出 Claude / Codex 宿主 smoke test 执行手册  
负责人智能体：评估团队  
协作智能体：总控团队  
依赖任务：PKG-01  
变更文件范围：`docs/host-smoke-test.md`  
TDD 步骤：先列出需要验证的 hooks / agents / skills / stop gate；再写手册；最后让 README/待办引用  
验收命令：`sed -n '1,260p' docs/host-smoke-test.md`  
验收标准：别人能按手册逐项验证 Claude / Codex 宿主集成

任务编号：PKG-03  
任务目标：补齐安装、卸载、重装与验证指南  
负责人智能体：标准团队  
协作智能体：执行团队  
依赖任务：PKG-01  
变更文件范围：`docs/install-operations.md`、`README.md`  
TDD 步骤：先梳理安装入口；再补卸载/重装；最后写安装后验证  
验收命令：`sed -n '1,260p' docs/install-operations.md`  
验收标准：第一次接手的使用者知道怎么装、怎么卸、怎么重装、怎么确认成功

任务编号：PKG-04  
任务目标：定版 Claude 分发策略并补发布流程文档  
负责人智能体：标准团队  
协作智能体：评估团队  
依赖任务：PKG-01  
变更文件范围：`docs/release-process.md`、`docs/remaining-tasks.md`、必要时 `README.md`  
TDD 步骤：先定策略；再写发布流程；最后更新待办状态  
验收命令：`sed -n '1,260p' docs/release-process.md`  
验收标准：Claude 当前分发策略明确，bundle / tag / release 路径可执行

任务编号：PKG-05  
任务目标：补齐异常输入测试，覆盖关键坏路径  
负责人智能体：执行团队  
协作智能体：总控团队  
依赖任务：PKG-01  
变更文件范围：`tests/`、必要时 `packages/harness-core/src/`  
TDD 步骤：先写失败测试；确认失败；再做最小实现；最后回归  
验收命令：`npm test`  
验收标准：至少覆盖 malformed contract、缺失 verification、无效 hooks 配置、空 repo / 无 package.json 场景

## 阶段门禁

本轮阶段完成前必须同时满足：

- `npm test` 通过
- `npm run review` 通过
- `npm run doctor` 通过
- `npm run bundle` 通过
- `npm run score` 通过

## 当前执行顺序

1. 总控先完成 PKG-01
2. 评估团队执行 PKG-02
3. 标准团队执行 PKG-03、PKG-04
4. 执行团队执行 PKG-05
5. 总控整合结果，统一 README / remaining-tasks / contract
