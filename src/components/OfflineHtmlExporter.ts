/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 导出单文件独立可运行离线 HTML 原型的生成器
// 用户在界面点击“导出离线单文件HTML”时，可以直接下载一个包含所有完整业务逻辑、内嵌样式与完整交互脚本的 .html 文件
export function generateStandaloneOfflineHtml(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>医疗设备数据采集批量巡检与单项诊断系统 (离线高保真演示版 V1.0)</title>
  <style>
    :root {
      --primary: #0284c7;
      --primary-dark: #0369a1;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --sidebar-bg: #0f172a;
      --border: #e2e8f0;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --success: #16a34a;
      --warning: #ea580c;
      --danger: #dc2626;
      --info: #2563eb;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; }
    body { background-color: var(--bg); color: var(--text-main); display: flex; height: 100vh; overflow: hidden; font-size: 14px; }
    
    /* Layout */
    .sidebar { width: 250px; background: var(--sidebar-bg); color: #fff; display: flex; flex-direction: column; flex-shrink: 0; border-right: 1px solid #1e293b; }
    .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .header { height: 56px; background: #fff; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
    .content { flex: 1; overflow-y: auto; padding: 20px; }
    
    /* Nav */
    .brand { padding: 18px 20px; font-size: 15px; font-weight: bold; border-bottom: 1px solid #1e293b; display: flex; align-items: center; gap: 8px; color: #38bdf8; }
    .nav-list { list-style: none; padding: 12px 8px; flex: 1; }
    .nav-item { padding: 10px 14px; border-radius: 6px; cursor: pointer; margin-bottom: 4px; display: flex; align-items: center; gap: 10px; color: #94a3b8; font-size: 13px; }
    .nav-item:hover, .nav-item.active { background: #1e293b; color: #fff; font-weight: 500; }
    .nav-item.active { background: #0369a1; color: #fff; }
    
    /* Cards & Stats */
    .stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 16px; }
    .stat-card { background: #fff; padding: 14px 16px; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 1px 2px rgba(0,0,0,0.03); }
    .stat-label { font-size: 12px; color: var(--text-muted); margin-bottom: 6px; }
    .stat-val { font-size: 22px; font-weight: bold; }
    
    /* Toolbar */
    .toolbar { background: #fff; padding: 14px 16px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; }
    .filters { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    select, input { padding: 7px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; outline: none; background: #fff; }
    select:focus, input:focus { border-color: var(--primary); }
    
    /* Buttons */
    .btn { padding: 7px 14px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { background: var(--primary-dark); }
    .btn-outline { border-color: var(--border); background: #fff; color: var(--text-main); }
    .btn-outline:hover { background: #f1f5f9; }
    .btn-danger { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }
    .btn-sm { padding: 4px 10px; font-size: 12px; }
    
    /* Table */
    .table-container { background: #fff; border-radius: 8px; border: 1px solid var(--border); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #f8fafc; padding: 12px 14px; font-size: 12px; font-weight: 600; color: #475569; border-bottom: 1px solid var(--border); }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: middle; }
    tr:hover { background: #f8fafc; }
    
    /* Badges */
    .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 500; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-warning { background: #ffedd5; color: #c2410c; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    .badge-info { background: #e0f2fe; color: #0369a1; }
    .badge-gray { background: #f1f5f9; color: #64748b; }
    
    /* Drawer */
    .drawer-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(2px); z-index: 50; display: none; }
    .drawer { position: fixed; top: 0; right: 0; bottom: 0; width: 640px; background: #fff; z-index: 60; box-shadow: -4px 0 25px rgba(0,0,0,0.15); display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
    .drawer.open { transform: translateX(0); }
    .drawer-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
    .drawer-body { flex: 1; overflow-y: auto; padding: 20px; }
    .drawer-footer { padding: 14px 20px; border-top: 1px solid var(--border); background: #f8fafc; display: flex; justify-content: space-between; align-items: center; }
    
    /* Timeline */
    .step-list { list-style: none; margin-top: 12px; position: relative; }
    .step-list::before { content: ''; position: absolute; left: 15px; top: 12px; bottom: 12px; width: 2px; background: #e2e8f0; }
    .step-item { position: relative; padding-left: 38px; margin-bottom: 16px; }
    .step-dot { position: absolute; left: 6px; top: 2px; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; color: #fff; background: #94a3b8; }
    .step-item.success .step-dot { background: var(--success); }
    .step-item.failed .step-dot { background: var(--danger); }
    .step-item.skipped .step-dot { background: #8b5cf6; }
    .step-item.running .step-dot { background: var(--primary); }
    .step-title { font-size: 13px; font-weight: 600; display: flex; justify-content: space-between; align-items: center; }
    .step-desc { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .step-evidence { margin-top: 6px; padding: 8px 10px; background: #f8fafc; border-radius: 6px; font-size: 12px; border-left: 3px solid var(--border); }
    
    /* Log block */
    .terminal-log { background: #0f172a; color: #e2e8f0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; padding: 12px; border-radius: 6px; max-height: 220px; overflow-y: auto; line-height: 1.5; }
    .log-line { display: flex; gap: 8px; margin-bottom: 2px; }
    .log-info { color: #38bdf8; }
    .log-warn { color: #fbbf24; }
    .log-error { color: #f87171; }
  </style>
</head>
<body>
  <!-- 侧边栏 -->
  <aside class="sidebar">
    <div class="brand">
      <span>🏥</span>
      <span>医疗IoT批量巡检系统</span>
    </div>
    <ul class="nav-list">
      <li class="nav-item active" onclick="switchTab('overview')">📊 批量巡检工作台</li>
      <li class="nav-item" onclick="switchTab('history')">📜 诊断与处理记录</li>
      <li class="nav-item" onclick="switchTab('rules')">📖 型号规则知识库</li>
      <li class="nav-item" onclick="switchTab('topology')">🌐 采集链路拓扑</li>
    </ul>
    <div style="padding: 16px; font-size: 11px; color: #64748b; border-top: 1px solid #1e293b;">
      <div>版本: V1.0 商业级原型</div>
      <div style="margin-top:4px;">两阶段规则遵循: 严格隔离</div>
    </div>
  </aside>

  <!-- 主工作区 -->
  <main class="main">
    <header class="header">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-weight: 600; font-size: 15px;">总院区 · 第一手术部 · 巡检工作台</span>
        <span class="badge badge-info">生产环境数据镜像</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-primary" onclick="startBatchInspection()">⚡ 一键批量巡检 (近5分钟DB数据)</button>
      </div>
    </header>

    <div class="content" id="mainContent">
      <!-- 统计指标 -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">监测设备总数</div>
          <div class="stat-val" id="statDevTotal">15</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">监测线号总数</div>
          <div class="stat-val" id="statLineTotal">19</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">采集正常率</div>
          <div class="stat-val" style="color: var(--success);" id="statNormalRate">40%</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">部分线无数据</div>
          <div class="stat-val" style="color: #d97706;" id="statPartial">1</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">无数据待诊断</div>
          <div class="stat-val" style="color: var(--danger);" id="statNoData">9</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">查询异常/配置缺失</div>
          <div class="stat-val" style="color: #64748b;" id="statQueryErr">2</div>
        </div>
      </div>

      <!-- 巡检前采集盒总览指示 -->
      <div id="preInspectionBanner" style="background: #fff; padding: 12px 16px; border-radius: 8px; border: 1px solid var(--border); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">📦</span>
          <div>
            <div style="font-weight: bold; font-size: 13px;">以采集设备盒子为主视图 (巡检前状态)</div>
            <div style="font-size: 11px; color: var(--text-muted);">展示各个采集盒物理地点、IP、版本型号与连接设备数；点击“一键巡检”后展示本次巡检结果与采集总和。</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-primary" onclick="startBatchInspection()">⚡ 一键批量巡检 (近5m DB)</button>
        </div>
      </div>

      <!-- 本次巡检完成后的结果与各个状态采集总和 (巡检后展示) -->
      <div id="postInspectionSummary" style="display: none; background: #fff; border: 2px solid var(--primary); padding: 14px 16px; border-radius: 8px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0;">
          <div style="font-weight: bold; color: var(--primary); font-size: 13px;">✓ 本次一键巡检已完成 · 各个状态采集总和已就绪 (耗时 124ms)</div>
          <div style="font-size: 11px; color: var(--text-muted);" id="postInspectTime">-</div>
        </div>
        <div class="stat-grid" style="margin-bottom: 0;">
          <div class="stat-card">
            <div class="stat-label">巡检盒子总数</div>
            <div class="stat-val" id="statBoxTotal">14</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">正常采集盒子</div>
            <div class="stat-val" style="color: var(--success);" id="statBoxNormal">5</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">部分线无数据</div>
            <div class="stat-val" style="color: #d97706;" id="statBoxPartial">1</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">无数据待诊断</div>
            <div class="stat-val" style="color: var(--danger);" id="statBoxNoData">7</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">采集盒掉线/脱网</div>
            <div class="stat-val" style="color: #b91c1c;" id="statBoxOffline">1</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">时序库查询异常</div>
            <div class="stat-val" style="color: #64748b;" id="statBoxQueryErr">1</div>
          </div>
        </div>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="filters">
          <select id="filterStatus" onchange="applyFilters()">
            <option value="ALL">全部盒子状态</option>
            <option value="NORMAL">采集正常</option>
            <option value="PARTIAL_NO_DATA">部分线无数据</option>
            <option value="ALL_NO_DATA">无数据待诊断</option>
            <option value="OFFLINE">盒子离线</option>
            <option value="QUERY_ERROR">查询失败</option>
          </select>
          <input type="text" id="searchKeyword" placeholder="搜索采集盒名称/IP/位置/型号..." oninput="applyFilters()" style="width: 240px;">
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline btn-sm" onclick="setBoxViewMode('CARD')">🔲 卡片视图</button>
          <button class="btn btn-outline btn-sm" onclick="setBoxViewMode('LIST')">📄 表格视图</button>
        </div>
      </div>

      <!-- 采集盒卡片网格容器 -->
      <div id="boxCardsContainer" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; margin-bottom: 20px;">
        <!-- 动态生成卡片 -->
      </div>

      <!-- 采集盒表格视图容器 (可切换) -->
      <div class="table-container" id="boxTableContainer" style="display: none;">
        <table>
          <thead>
            <tr>
              <th>采集盒名称 / 编号</th>
              <th>物理地点</th>
              <th>IP 地址</th>
              <th>版本型号 / 固件</th>
              <th>连接设备台数</th>
              <th>挂载线号</th>
              <th>巡检状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody id="boxTableBody">
            <!-- 动态渲染 -->
          </tbody>
        </table>
      </div>
    </div>
  </main>

  <!-- 采集盒详情弹窗 -->
  <div class="drawer-overlay" id="boxDetailOverlay" onclick="closeBoxDetail()"></div>
  <div class="drawer" id="boxDetailModal" style="width: 580px;">
    <div class="drawer-header">
      <div>
        <div style="font-size: 15px; font-weight: bold;" id="bdTitle">采集盒台账详情</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;" id="bdSubtitle">IP / MAC / 连接设备</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="closeBoxDetail()">✕ 关闭</button>
    </div>
    <div class="drawer-body" id="bdBody">
      <!-- 动态注入盒子详情 -->
    </div>
  </div>

  <!-- 诊断抽屉 -->
  <div class="drawer-overlay" id="drawerOverlay" onclick="closeDrawer()"></div>
  <div class="drawer" id="diagDrawer">
    <div class="drawer-header">
      <div>
        <div style="font-size: 15px; font-weight: bold;" id="drawerTitle">单项链路诊断工作区</div>
        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;" id="drawerSubtitle">DEV-02 / 线号 L02</div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="closeDrawer()">✕ 关闭</button>
    </div>
    <div class="drawer-body">
      <!-- 区域 1: 对象信息 -->
      <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: 6px; padding: 12px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">📋 诊断对象信息</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div>设备名称: <b id="dDevName">-</b></div>
          <div>手术间: <span id="dRoom">-</span></div>
          <div>采集盒 IP: <code id="dBoxIp">-</code></div>
          <div>目标线号: <b style="color: var(--primary);" id="dLineId">-</b></div>
          <div style="grid-column: span 2;">同盒其他线号: <span id="dCoBoxLines">-</span></div>
        </div>
      </div>

      <!-- 区域 2: 诊断步骤 -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">🔍 诊断步骤执行链路 (顺序只读核验)</div>
        <ul class="step-list" id="stepList">
          <!-- 步骤项 -->
        </ul>
      </div>

      <!-- 关键分支交互：确认患者使用状态 -->
      <div id="patientConfirmBox" style="display: none; background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 13px; color: #b45309; margin-bottom: 4px;">❓ 关键判定：当前设备是否有患者使用？</div>
        <div style="font-size: 12px; color: #92400e; margin-bottom: 10px;">
          检测到采集盒下行口已收到物理报文 (recv > 0)，但近 5 分钟无入库数据。依据产品规则，需核实临床现场状态：
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-sm btn-outline" style="border-color: #f59e0b;" onclick="handlePatientConfirm('YES')">👤 有患者使用 (转网关排查)</button>
          <button class="btn btn-sm btn-outline" style="border-color: #10b981;" onclick="handlePatientConfirm('NO')">🛏️ 无患者使用 (闲置符合预期)</button>
        </div>
      </div>

      <!-- 区域 3: 诊断结论与建议 -->
      <div style="margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">🎯 诊断结论与处置建议</div>
        <div id="conclusionCard" style="padding: 14px; border-radius: 6px; border: 1px solid var(--border); background: #f8fafc;">
          <!-- 动态结论 -->
        </div>
      </div>

      <!-- 区域 4: 原始日志 -->
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="font-size: 13px; font-weight: 600;">💻 诊断原始报文与控制台日志</div>
          <button class="btn btn-outline btn-sm" onclick="copyLogs()">📋 复制日志</button>
        </div>
        <div class="terminal-log" id="terminalLogs">
          <!-- 日志行 -->
        </div>
      </div>
    </div>
    <div class="drawer-footer">
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline btn-sm" onclick="runDiagnosisAgain()">🔄 重新诊断</button>
        <button class="btn btn-outline btn-sm" onclick="copyReport()">📄 复制结构化诊断报告</button>
      </div>
      <div style="display: flex; gap: 8px;">
        <button class="btn btn-danger btn-sm" onclick="dispatchTicket()">📨 转交网关工程师</button>
        <button class="btn btn-primary btn-sm" onclick="markHandled()">✅ 标记已处理</button>
      </div>
    </div>
  </div>

  <script>
    // 采集设备盒子模型 (以采集盒为主实体)
    const mockBoxes = [
      { id: 'BOX-01', name: '1号数字化手术室主采集盒', ip: '192.168.10.101', mac: '00:1A:C2:7B:82:11', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '总院区 手术间 01 (心胸数字化) 吊塔机柜 A01', devCount: 1, devName: 'BeneVision N17', devId: 'DEV-01', lines: 'L01, L02', status: 'NORMAL', time: '20:10:00', lastData: '2026-10-20 20:10:45', count5m: '1480点' },
      { id: 'BOX-02', name: '2号神经外科手术室采集盒', ip: '192.168.10.102', mac: '00:1A:C2:7B:82:12', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '总院区 手术间 02 (神经外科) 吊塔机柜 B01', devCount: 1, devName: 'BeneVision N15', devId: 'DEV-02', lines: 'L01, L02', status: 'PARTIAL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 20:09:55', count5m: 'L01:1390点, L02:0点', note: '同盒L01正常，L02无数据' },
      { id: 'BOX-03', name: '3号骨科手术室采集盒', ip: '192.168.10.103', mac: '00:1A:C2:7B:82:13', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '总院区 手术间 03 (骨科手术室) 吊塔柜 C01', devCount: 1, devName: 'Primus', devId: 'DEV-03', lines: 'L01', status: 'OFFLINE', time: '20:10:00', lastData: '2026-10-20 16:20:00', count5m: '0点', note: '采集盒疑似断电/网线脱开' },
      { id: 'BOX-04', name: '4号普外腔镜手术室采集盒', ip: '192.168.10.104', mac: '00:1A:C2:7B:82:14', model: 'MedGate-Standard 300', firmware: 'V2.4.12', location: '总院区 手术间 04 (普外腔镜) 移动推车', devCount: 1, devName: 'IntelliVue MX800', devId: 'DEV-04', lines: 'L01', status: 'ALL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 15:40:12', count5m: '0点', note: '读不到预期线号' },
      { id: 'BOX-05', name: '5号心血管外科采集盒', ip: '192.168.10.105', mac: '00:1A:C2:7B:82:15', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '总院区 手术间 05 (心血管外科) 吊塔B侧', devCount: 1, devName: 'Servo-i', devId: 'DEV-05', lines: 'L01', status: 'ALL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 14:10:00', count5m: '0点', note: 'fopen配置文件失败' },
      { id: 'BOX-06', name: '6号妇产科手术室采集盒', ip: '192.168.10.106', mac: '00:1A:C2:7B:82:16', model: 'MedGate-Standard 300', firmware: 'V2.4.12', location: '总院区 手术间 06 (妇产科手术室) 麻醉吊塔', devCount: 1, devName: 'Avance CS2', devId: 'DEV-06', lines: 'L01', status: 'ALL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 13:50:00', count5m: '0点', note: '配置下发超时' },
      { id: 'BOX-07', name: '7号泌尿外科采集盒', ip: '192.168.10.107', mac: '00:1A:C2:7B:82:17', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '总院区 手术间 07 (泌尿外科) 腔镜推车', devCount: 1, devName: 'BeneVision N12', devId: 'DEV-07', lines: 'L01', status: 'ALL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 12:30:00', count5m: '0点', note: 'fclose保存失败' },
      { id: 'BOX-08', name: '8号日间手术室采集盒', ip: '192.168.10.108', mac: '00:1A:C2:7B:82:18', model: 'MedGate-Lite 200', firmware: 'V2.4.12', location: '总院区 手术间 08 (日间手术室) 设备柜', devCount: 1, devName: 'Hamilton-G5', devId: 'DEV-08', lines: 'L01', status: 'ALL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 11:20:00', count5m: '0点', note: 'attach端口失败' },
      { id: 'BOX-09', name: '9号五官头颈外科采集盒', ip: '192.168.10.109', mac: '00:1A:C2:7B:82:19', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '总院区 手术间 09 (五官头颈外科) 麻醉吊塔', devCount: 1, devName: 'Primus', devId: 'DEV-09', lines: 'L01', status: 'ALL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 10:15:00', count5m: '0点', note: 'attach OK但recv=0' },
      { id: 'BOX-10', name: '10号数字化复合杂交手术室采集盒', ip: '192.168.10.110', mac: '00:1A:C2:7B:82:20', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '总院区 手术间 10 (数字化复合杂交) 铅房控制室', devCount: 1, devName: 'BeneVision N17', devId: 'DEV-10', lines: 'L01', status: 'ALL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 09:40:00', count5m: '0点', note: '有患者但未入库' },
      { id: 'BOX-11', name: '11号急诊抢救手术间采集盒', ip: '192.168.10.111', mac: '00:1A:C2:7B:82:21', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '总院区 手术间 11 (急诊抢救手术间) 吊塔', devCount: 1, devName: 'IntelliVue MX700', devId: 'DEV-11', lines: 'L01', status: 'ALL_NO_DATA', time: '20:10:00', lastData: '2026-10-20 08:30:00', count5m: '0点', note: '无患者闲置正常' },
      { id: 'BOX-12', name: '12号儿科手术室采集盒', ip: '192.168.10.112', mac: '00:1A:C2:7B:82:22', model: 'MedGate-Standard 300', firmware: 'V2.4.12', location: '总院区 手术间 12 (儿科手术室) 麻醉车', devCount: 1, devName: 'Perseus A500', devId: 'DEV-12', lines: 'L01', status: 'QUERY_ERROR', time: '20:10:00', lastData: '-', count5m: '查询超时', note: '时序库超时' },
      { id: 'BOX-14', name: 'PACU苏醒区2床采集盒', ip: '192.168.10.114', mac: '00:1A:C2:7B:82:24', model: 'MedGate-Lite 200', firmware: 'V2.4.12', location: '总院区 PACU 床位 02 呼叫带旁', devCount: 1, devName: 'BeneVision N12', devId: 'DEV-14', lines: 'L01', status: 'NORMAL', time: '20:10:00', lastData: '2026-10-20 20:11:10', count5m: '1240点' },
      { id: 'BOX-15', name: 'ICU负压隔离间主采集盒', ip: '192.168.20.101', mac: '00:1A:C2:7B:83:01', model: 'MedGate-Pro 400', firmware: 'V2.4.12', location: '东院区 ICU 负压隔离间 01 吊桥机箱', devCount: 1, devName: 'Hamilton-C6', devId: 'DEV-15', lines: 'L01', status: 'NORMAL', time: '20:10:00', lastData: '2026-10-20 20:11:32', count5m: '1520点' }
    ];

    const mockDevices = [
      { id: 'DEV-01', name: '多参数监护仪 N17', room: '手术间 01', boxIp: '192.168.10.101', status: 'NORMAL', lines: [{ id: 'L01', name: 'ECG/SpO2', status: 'NORMAL', count: 1480, time: '20:10:45' }, { id: 'L02', name: 'CO2/Gas', status: 'NORMAL', count: 1475, time: '20:10:42' }] },
      { id: 'DEV-02', name: '双通道监护仪 N15', room: '手术间 02', boxIp: '192.168.10.102', status: 'PARTIAL_NO_DATA', lines: [{ id: 'L01', name: '主参数', status: 'NORMAL', count: 1390, time: '20:09:55' }, { id: 'L02', name: 'BIS脑电', status: 'NO_DATA_PENDING', count: 0, time: '17:15:20' }] },
      { id: 'DEV-03', name: '麻醉工作站 Primus', room: '手术间 03', boxIp: '192.168.10.103', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: 'Medibus', status: 'NO_DATA_PENDING', count: 0, time: '16:20:00' }] },
      { id: 'DEV-04', name: '监护仪 MX800', room: '手术间 04', boxIp: '192.168.10.104', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: 'MX800高速波形', status: 'NO_DATA_PENDING', count: 0, time: '15:40:12' }] },
      { id: 'DEV-05', name: '重症呼吸机 Servo-i', room: '手术间 05', boxIp: '192.168.10.105', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: 'SCI参数', status: 'NO_DATA_PENDING', count: 0, time: '14:10:00' }] },
      { id: 'DEV-06', name: '麻醉机 Avance CS2', room: '手术间 06', boxIp: '192.168.10.106', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: 'GE通气参数', status: 'NO_DATA_PENDING', count: 0, time: '13:50:00' }] },
      { id: 'DEV-07', name: '监护仪 N12', room: '手术间 07', boxIp: '192.168.10.107', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: '体征主线', status: 'NO_DATA_PENDING', count: 0, time: '12:30:00' }] },
      { id: 'DEV-08', name: '呼吸机 Hamilton-G5', room: '手术间 08', boxIp: '192.168.10.108', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: 'DCI通道', status: 'NO_DATA_PENDING', count: 0, time: '11:20:00' }] },
      { id: 'DEV-09', name: '麻醉机 Primus', room: '手术间 09', boxIp: '192.168.10.109', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: '通气通道', status: 'NO_DATA_PENDING', count: 0, time: '10:15:00' }] },
      { id: 'DEV-10', name: '监护仪 N17', room: '手术间 10', boxIp: '192.168.10.110', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: '体征采集', status: 'NO_DATA_PENDING', count: 0, time: '09:40:00' }] },
      { id: 'DEV-11', name: '监护仪 MX700', room: '手术间 11', boxIp: '192.168.10.111', status: 'ALL_NO_DATA', lines: [{ id: 'L01', name: 'MX700通道', status: 'NO_DATA_PENDING', count: 0, time: '08:30:00' }] },
      { id: 'DEV-12', name: '麻醉机 Perseus A500', room: '手术间 12', boxIp: '192.168.10.112', status: 'QUERY_ERROR', lines: [{ id: 'L01', name: 'MedibusX', status: 'QUERY_FAILED', count: -1, time: '-' }] },
      { id: 'DEV-14', name: '苏醒监护仪 N12', room: 'PACU 床位 02', boxIp: '192.168.10.114', status: 'NORMAL', lines: [{ id: 'L01', name: 'ECG/SpO2', status: 'NORMAL', count: 1240, time: '20:11:10' }] },
      { id: 'DEV-15', name: '呼吸机 Hamilton-C6', room: 'ICU 负压隔离间 01', boxIp: '192.168.20.101', status: 'NORMAL', lines: [{ id: 'L01', name: 'DCI通道', status: 'NORMAL', count: 1520, time: '20:11:32' }] }
    ];

    let currentDev = null;
    let currentLine = null;
    let boxViewMode = 'CARD';
    let isInspected = false;

    function setBoxViewMode(mode) {
      boxViewMode = mode;
      document.getElementById('boxCardsContainer').style.display = mode === 'CARD' ? 'grid' : 'none';
      document.getElementById('boxTableContainer').style.display = mode === 'LIST' ? 'block' : 'none';
      renderBoxes();
    }

    function renderBoxes() {
      const cardsCont = document.getElementById('boxCardsContainer');
      const tableBody = document.getElementById('boxTableBody');
      const keyword = document.getElementById('searchKeyword').value.trim().toLowerCase();
      const statusFilter = document.getElementById('filterStatus').value;

      cardsCont.innerHTML = '';
      tableBody.innerHTML = '';

      mockBoxes.forEach(box => {
        if (statusFilter !== 'ALL' && box.status !== statusFilter) return;
        if (keyword && !box.name.toLowerCase().includes(keyword) && !box.location.toLowerCase().includes(keyword) && !box.ip.includes(keyword) && !box.model.toLowerCase().includes(keyword)) return;

        const badge = getStatusBadge(box.status);
        const isAbnormal = box.status !== 'NORMAL';

        // 渲染卡片
        const card = document.createElement('div');
        card.style = 'background: #fff; padding: 16px; border-radius: 8px; border: 1px solid ' + (isAbnormal ? '#fca5a5' : '#e2e8f0') + '; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 2px rgba(0,0,0,0.03);';
        
        let cardAction = '<span style="color: #16a34a; font-size: 11px;">✓ 运行正常</span>';
        if (isAbnormal) {
          cardAction = '<button class="btn btn-primary btn-sm" onclick="openDiagnosis(\\'' + box.devId + '\\', \\'L01\\')">🔍 诊断与处理建议</button>';
        }

        card.innerHTML = '<div>' +
          '<div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">' +
            '<div>' +
              '<div style="font-weight: bold; font-size: 13px; color: #0f172a;">' + box.name + '</div>' +
              '<div style="font-size: 11px; color: #64748b; margin-top: 2px;">' + box.location + '</div>' +
            '</div>' +
            badge +
          '</div>' +
          '<div style="background: #f8fafc; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; border: 1px solid #f1f5f9; line-height: 1.6;">' +
            '<div><span style="color: #64748b;">IP 地址:</span> <code style="color: #0369a1; font-weight: bold;">' + box.ip + '</code></div>' +
            '<div><span style="color: #64748b;">版本型号:</span> <b>' + box.model + '</b> (固件: ' + box.firmware + ')</div>' +
            '<div><span style="color: #64748b;">连接设备数:</span> <b>' + box.devCount + ' 台</b> (' + box.devName + ')</div>' +
            '<div><span style="color: #64748b;">挂载线号:</span> <span style="color: #2563eb; font-weight: 500;">' + box.lines + '</span></div>' +
            '<div style="font-size: 11px; color: #64748b; margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">上次巡检时间: ' + box.time + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #f1f5f9;">' +
          '<button class="btn btn-outline btn-sm" onclick="openBoxDetail(\\'' + box.id + '\\')">📋 查看详情</button>' +
          cardAction +
        '</div>';
        cardsCont.appendChild(card);

        // 渲染表格行
        const tr = document.createElement('tr');
        tr.innerHTML = '<td><b>' + box.name + '</b><br><span style="font-size: 10px; color: #94a3b8;">' + box.id + '</span></td>' +
          '<td style="font-size: 12px;">' + box.location + '</td>' +
          '<td><code>' + box.ip + '</code></td>' +
          '<td>' + box.model + '<br><span style="font-size: 10px; color: #64748b;">' + box.firmware + '</span></td>' +
          '<td><b>' + box.devCount + ' 台</b></td>' +
          '<td>' + box.lines + '</td>' +
          '<td>' + badge + '</td>' +
          '<td style="text-align: right;">' +
            '<button class="btn btn-outline btn-sm" style="margin-right: 6px;" onclick="openBoxDetail(\\'' + box.id + '\\')">详情</button>' +
            (isAbnormal ? '<button class="btn btn-primary btn-sm" onclick="openDiagnosis(\\'' + box.devId + '\\', \\'L01\\')">诊断建议</button>' : '<span style="color:#16a34a; font-size: 11px;">正常</span>') +
          '</td>';
        tableBody.appendChild(tr);
      });
    }

    function openBoxDetail(boxId) {
      const box = mockBoxes.find(b => b.id === boxId);
      if (!box) return;
      document.getElementById('bdTitle').innerText = '采集盒台账详情 - ' + box.name;
      document.getElementById('bdSubtitle').innerText = '物理位置: ' + box.location;
      
      const body = document.getElementById('bdBody');
      body.innerHTML = '<div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 14px; font-size: 12px; line-height: 1.8;">' +
        '<div style="font-weight: bold; margin-bottom: 6px; color: #0369a1;">📦 硬件与网络参数</div>' +
        '<div><b>采集盒 IP:</b> <code>' + box.ip + '</code></div>' +
        '<div><b>MAC 地址:</b> <code>' + box.mac + '</code></div>' +
        '<div><b>版本型号:</b> ' + box.model + '</div>' +
        '<div><b>固件版本:</b> ' + box.firmware + '</div>' +
        '<div><b>供电状态:</b> 市电正常 (220V AC 在网)</div>' +
        '<div><b>上行端口:</b> ETH0 (1000Mbps Full, VLAN 102)</div>' +
        '<div><b>上次巡检状态:</b> ' + box.status + ' (' + box.time + ')</div>' +
      '</div>' +
      '<div style="background: #fff; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 12px; line-height: 1.8;">' +
        '<div style="font-weight: bold; margin-bottom: 6px; color: #0369a1;">🔌 连接设备与下行线号</div>' +
        '<div><b>挂载设备:</b> ' + box.devName + ' (连接 ' + box.devCount + ' 台)</div>' +
        '<div><b>下行线号:</b> ' + box.lines + '</div>' +
        '<div><b>近5分钟数据量:</b> ' + box.count5m + '</div>' +
        '<div><b>最后入库时间:</b> ' + box.lastData + '</div>' +
        '<div style="margin-top: 8px; color: #64748b; font-size: 11px;">* 采集盒下行串口监听各线号物理电平，接收正常后上传网关入库。</div>' +
      '</div>';

      document.getElementById('boxDetailOverlay').style.display = 'block';
      document.getElementById('boxDetailModal').classList.add('open');
    }

    function closeBoxDetail() {
      document.getElementById('boxDetailOverlay').style.display = 'none';
      document.getElementById('boxDetailModal').classList.remove('open');
    }

    function getStatusBadge(status) {
      switch (status) {
        case 'NORMAL': return '<span class="badge badge-success">● 采集正常</span>';
        case 'PARTIAL_NO_DATA': return '<span class="badge badge-warning">▲ 部分线无数据</span>';
        case 'ALL_NO_DATA': return '<span class="badge badge-danger">■ 无数据待诊断</span>';
        case 'OFFLINE': return '<span class="badge badge-danger">⚡ 采集盒离线</span>';
        case 'QUERY_ERROR': return '<span class="badge badge-gray">✖ 查询失败</span>';
        case 'BINDING_INCOMPLETE': return '<span class="badge badge-gray">? 绑定不完整</span>';
        default: return '<span class="badge badge-gray">' + status + '</span>';
      }
    }

    function applyFilters() {
      renderBoxes();
    }

    function startBatchInspection() {
      document.getElementById('preInspectionBanner').style.display = 'none';
      const summary = document.getElementById('postInspectionSummary');
      summary.style.display = 'block';
      document.getElementById('postInspectTime').innerText = '巡检完成时间: ' + new Date().toLocaleString();
      isInspected = true;
      renderBoxes();
    }

    function openDiagnosis(devId, lineId) {
      currentDev = mockDevices.find(d => d.id === devId);
      currentLine = currentDev.lines.find(l => l.id === lineId);
      
      document.getElementById('drawerTitle').innerText = '单项链路诊断 - ' + currentDev.name;
      document.getElementById('drawerSubtitle').innerText = currentDev.room + ' | 线号 ' + currentLine.id + ' (' + currentLine.name + ')';
      document.getElementById('dDevName').innerText = currentDev.name;
      document.getElementById('dRoom').innerText = currentDev.room;
      document.getElementById('dBoxIp').innerText = currentDev.boxIp;
      document.getElementById('dLineId').innerText = currentLine.id;
      
      const coLines = currentDev.lines.filter(l => l.id !== currentLine.id);
      document.getElementById('dCoBoxLines').innerText = coLines.length > 0 
        ? coLines.map(l => l.id + ' (' + l.count + '点/5min)').join(', ')
        : '单线设备，同盒无其他线';

      document.getElementById('patientConfirmBox').style.display = 'none';
      document.getElementById('drawerOverlay').style.display = 'block';
      document.getElementById('diagDrawer').classList.add('open');

      runDiagnosisCore(currentDev, currentLine);
    }

    function closeDrawer() {
      document.getElementById('drawerOverlay').style.display = 'none';
      document.getElementById('diagDrawer').classList.remove('open');
    }

    function runDiagnosisCore(dev, line, patientChoice) {
      const stepList = document.getElementById('stepList');
      const conclusionCard = document.getElementById('conclusionCard');
      const terminalLogs = document.getElementById('terminalLogs');
      const patientBox = document.getElementById('patientConfirmBox');
      stepList.innerHTML = '<div style="color: #64748b; font-size: 12px;">正在按顺序读取只读状态与证据链...</div>';
      terminalLogs.innerHTML = '';

      function addLog(level, msg) {
        const div = document.createElement('div');
        div.className = 'log-line';
        div.innerHTML = '<span style="color:#64748b;">[' + new Date().toLocaleTimeString() + ']</span> <span class="log-' + level.toLowerCase() + '">[' + level + ']</span> <span>' + msg + '</span>';
        terminalLogs.appendChild(div);
      }

      // 诊断逻辑分支
      const isCoBoxNormal = currentDev.lines.some(l => l.id !== line.id && l.count > 0);
      const isPingFail = dev.id === 'DEV-03';
      const isNoExpectedLine = dev.id === 'DEV-04';
      const isFopenFail = dev.id === 'DEV-05';
      const isConfigPushFail = dev.id === 'DEV-06';
      const isFcloseFail = dev.id === 'DEV-07';
      const isAttachFail = dev.id === 'DEV-08';
      const isRecvZero = dev.id === 'DEV-09';
      const isRecvGtZero = dev.id === 'DEV-10' || dev.id === 'DEV-11' || dev.id === 'DEV-02';

      addLog('INFO', '启动单项诊断：设备 ' + dev.name + ', 线号 ' + line.id);

      setTimeout(() => {
        let steps = [];
        // Step 1
        if (isCoBoxNormal) {
          addLog('INFO', '检测到同盒其他线号正常接收，触发规则：跳过 Ping 测试，已具备在线证据');
          steps.push({ num: 1, title: '同盒共存与网络连通性检查', status: 'skipped', desc: '跳过 Ping：同盒其他线号近5分钟有数据，已具备采集盒与网络在线证据' });
        } else if (isPingFail) {
          addLog('ERROR', 'Ping ' + dev.boxIp + ' 失败：100% loss，采集盒网络不可达');
          steps.push({ num: 1, title: '同盒共存与网络连通性检查', status: 'failed', desc: 'Ping ' + dev.boxIp + ' 失败 (100% loss)' });
          renderSteps(steps);
          conclusionCard.innerHTML = '<div style="color: #b91c1c; font-weight: bold; margin-bottom: 4px;">❌ 采集盒网络不可达 / 硬件掉电脱网</div><div style="font-size: 12px; color: #475569;">建议责任人: 现场交付工程师<br>处置: 检查吊塔采集盒电源适配器、指示灯与交换机网线是否松脱。后续配置与收包步骤阻断未执行。</div>';
          return;
        } else {
          addLog('INFO', 'Ping ' + dev.boxIp + ' 成功 (RTT 1.8ms)');
          steps.push({ num: 1, title: '同盒共存与网络连通性检查', status: 'success', desc: 'Ping 采集盒成功 (RTT 1.8ms)' });
        }

        // Step 2
        if (isNoExpectedLine) {
          addLog('ERROR', '未读取到预期线号 ' + line.id + ' 注册映射');
          steps.push({ num: 2, title: '读取预期线号配置', status: 'failed', desc: '在采集盒未找到预期线号 ' + line.id });
          renderSteps(steps);
          conclusionCard.innerHTML = '<div style="color: #c2410c; font-weight: bold; margin-bottom: 4px;">⚠️ 采集盒在线但读不到预期线号</div><div style="font-size: 12px; color: #475569;">处置: 提示现场人员拍照核实物理串口/网口接线，检查线缆是否松脱；确认接线正常后再转网关工程师排查线号映射。</div>';
          return;
        }
        steps.push({ num: 2, title: '读取预期线号配置', status: 'success', desc: '成功读取预期线号 ' + line.id + ' 映射参数' });

        // Step 3
        if (isFopenFail) {
          addLog('ERROR', 'fopen(' + line.id + '.json) 失败: 文件不存在');
          steps.push({ num: 3, title: 'fopen 打开配置文件', status: 'failed', desc: '打开 ' + line.id + '.json 失败 (ENOENT)' });
          renderSteps(steps);
          conclusionCard.innerHTML = '<div style="color: #b91c1c; font-weight: bold; margin-bottom: 4px;">❌ fopen 打开配置文件失败</div><div style="font-size: 12px; color: #475569;">建议责任人: 网关工程师<br>处置: 网关侧重新生成该型号配置文件并下发至采集盒。</div>';
          return;
        }
        steps.push({ num: 3, title: 'fopen 打开配置文件', status: 'success', desc: 'fopen 成功 (fd=8)' });

        // Step 4
        if (isConfigPushFail) {
          addLog('ERROR', '平台配置下发超时 (5000ms)');
          steps.push({ num: 4, title: '平台配置下发与校验', status: 'failed', desc: '等待采集盒 ACK 超时' });
          renderSteps(steps);
          conclusionCard.innerHTML = '<div style="color: #b91c1c; font-weight: bold; margin-bottom: 4px;">❌ 平台配置下发超时</div><div style="font-size: 12px; color: #475569;">建议责任人: 网关工程师<br>处置: 排查 MQTT/RPC 下发通道与队列阻塞。</div>';
          return;
        }
        steps.push({ num: 4, title: '平台配置下发与校验', status: 'success', desc: '配置校验 ACK 正常' });

        // Step 5
        if (isFcloseFail) {
          addLog('ERROR', 'fclose 失败: 只读文件系统 (EROFS)');
          steps.push({ num: 5, title: 'fclose 保存关闭文件', status: 'failed', desc: '只读存储介质无法落盘' });
          renderSteps(steps);
          conclusionCard.innerHTML = '<div style="color: #b91c1c; font-weight: bold; margin-bottom: 4px;">❌ fclose 保存配置失败</div><div style="font-size: 12px; color: #475569;">建议责任人: 网关工程师 / 现场交付<br>处置: 采集盒存储文件系统异常置为只读，需格式化或更换采集盒。</div>';
          return;
        }
        steps.push({ num: 5, title: 'fclose 保存关闭文件', status: 'success', desc: 'fclose 成功返回 0' });

        // Step 6
        if (isAttachFail) {
          addLog('ERROR', 'attach 端口失败: STATUS_PORT_BUSY');
          steps.push({ num: 6, title: 'attach 应用下行端口', status: 'failed', desc: '串口波特率冲突或端口被占用' });
          renderSteps(steps);
          conclusionCard.innerHTML = '<div style="color: #b91c1c; font-weight: bold; margin-bottom: 4px;">❌ attach 应用下行端口失败</div><div style="font-size: 12px; color: #475569;">建议责任人: 网关工程师<br>处置: 核对线号串口波特率配置与驱动。</div>';
          return;
        }
        steps.push({ num: 6, title: 'attach 应用下行端口', status: 'success', desc: 'attach OK (仅代表配置走通，不代表设备正在发有效数据)' });

        // Step 7
        if (isRecvZero) {
          addLog('WARN', 'recv 超时：采集盒下行物理口未收到任何数据 (recv = 0)');
          steps.push({ num: 7, title: 'recv 报文接收检查', status: 'failed', desc: '下行口静默 (recv = 0)' });
          renderSteps(steps);
          conclusionCard.innerHTML = '<div style="color: #c2410c; font-weight: bold; margin-bottom: 4px;">⚠️ 设备侧无数据输出 (recv = 0)</div><div style="font-size: 12px; color: #475569;">建议责任人: 现场交付人员<br>处置: 采集盒与配置完全正常！请现场检查医疗设备是否开机并退出Standby待机模式、专用线缆两端是否插牢、设备后台数据输出开关是否开启。</div>';
          return;
        }
        
        steps.push({ num: 7, title: 'recv 报文接收检查', status: 'success', desc: '收到物理报文 (recv > 0, 抓取到 18 个协议帧)' });

        // Step 8: 入库核验与患者使用确认
        if (line.count === 0) {
          steps.push({ num: 8, title: '数据库入库核验', status: 'failed', desc: '近5分钟体征时序库无入库点' });
          renderSteps(steps);

          if (!patientChoice) {
            patientBox.style.display = 'block';
            conclusionCard.innerHTML = '<div style="color: #c2410c; font-weight: bold; margin-bottom: 4px;">❓ 收到报文但未入库，等待核实患者使用</div><div style="font-size: 12px; color: #475569;">请在上方黄色卡片选择当前设备是否有患者使用，以进一步定位。</div>';
          } else if (patientChoice === 'YES') {
            patientBox.style.display = 'none';
            conclusionCard.innerHTML = '<div style="color: #b91c1c; font-weight: bold; margin-bottom: 4px;">❌ 收到报文但未入库（网关解析/写库阻塞）</div><div style="font-size: 12px; color: #475569;">建议责任人: 网关工程师<br>处置: 现场已证实有患者使用，且下行口有报文(recv>0)。判定网关解析流水线异常或数据库写入事务锁死，需网关工程师立即排查 parse_error.log！</div>';
          } else {
            patientBox.style.display = 'none';
            conclusionCard.innerHTML = '<div style="color: #0369a1; font-weight: bold; margin-bottom: 4px;">ℹ️ 设备闲置未接患者，符合预期</div><div style="font-size: 12px; color: #475569;">建议责任人: 临床科室<br>处置: 依据型号规则，设备未接患者时仅发送空载心跳，平台过滤不入库符合规范。待手术开始连接患者后将自动产生数据。</div>';
          }
        } else {
          steps.push({ num: 8, title: '数据库入库核验', status: 'success', desc: '近5分钟入库正常' });
          renderSteps(steps);
          conclusionCard.innerHTML = '<div style="color: #15803d; font-weight: bold; margin-bottom: 4px;">✅ 采集链路完全正常</div><div style="font-size: 12px; color: #475569;">各项证据链完整，数据上报平稳。</div>';
        }
      }, 400);
    }

    function renderSteps(steps) {
      const stepList = document.getElementById('stepList');
      stepList.innerHTML = '';
      for (let i = 1; i <= 8; i++) {
        const found = steps.find(s => s.num === i);
        const li = document.createElement('li');
        if (found) {
          li.className = 'step-item ' + found.status;
          li.innerHTML = '<div class="step-dot">' + i + '</div><div class="step-title">' + found.title + '</div><div class="step-desc">' + found.desc + '</div>';
        } else {
          li.className = 'step-item';
          li.innerHTML = '<div class="step-dot">' + i + '</div><div class="step-title" style="color: #94a3b8;">步骤 ' + i + ' (未执行)</div><div class="step-desc">前置步骤失败或未触发</div>';
        }
        stepList.appendChild(li);
      }
    }

    function handlePatientConfirm(choice) {
      runDiagnosisCore(currentDev, currentLine, choice);
    }

    function runDiagnosisAgain() {
      runDiagnosisCore(currentDev, currentLine);
    }

    function copyLogs() {
      const logs = document.getElementById('terminalLogs').innerText;
      navigator.clipboard.writeText(logs);
      alert('日志已复制到剪贴板！');
    }

    function copyReport() {
      alert('结构化诊断报告已生成并复制到剪贴板！');
    }

    function dispatchTicket() {
      const note = prompt('请输入转交工单备注（网关工程师接收）：', '设备收到报文但近5分钟未入库，已现场确认患者在使用中，请检查网关解析进程。');
      if (note) {
        alert('已成功派发工单给网关值班工程师！工单号: #TICKET-' + Date.now());
      }
    }

    function markHandled() {
      const note = prompt('请输入现场排查处理结果：', '重新插紧下行转接线水晶头，设备恢复正常上报。');
      if (note) {
        alert('已记录现场处置结果，并归档至诊断历史表！');
        closeDrawer();
      }
    }

    function switchTab(tab) {
      if (tab === 'overview') {
        renderTable();
      } else {
        alert('切换到视图: ' + tab + ' (在完整版系统中支持全量交互)');
      }
    }

    // 初始化渲染
    renderTable();
  </script>
</body>
</html>`;
}
