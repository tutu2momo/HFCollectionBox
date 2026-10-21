/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Activity, 
  Download, 
  HelpCircle, 
  Share2, 
  Sliders, 
  Layers, 
  RefreshCw 
} from 'lucide-react';
import { generateStandaloneOfflineHtml } from './OfflineHtmlExporter';

interface HeaderProps {
  onOpenDemoScenarios: () => void;
  onOpenTopology: () => void;
  activeTab: string;
  onRunBatchInspection: () => void;
  isInspecting: boolean;
  campus: string;
  setCampus: (c: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDemoScenarios,
  onOpenTopology,
  activeTab,
  onRunBatchInspection,
  isInspecting,
  campus,
  setCampus
}) => {
  const handleExportOfflineHtml = () => {
    const htmlContent = generateStandaloneOfflineHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `医疗物联网批量巡检系统_高保真交互原型_V1.0.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs z-20">
      {/* 左侧：面包屑与位置 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span className="text-slate-800 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            医疗物联网管理端
          </span>
          <span>/</span>
          <select 
            value={campus} 
            onChange={(e) => setCampus(e.target.value)}
            className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-300 font-medium hover:bg-slate-200 transition cursor-pointer outline-none"
          >
            <option value="ALL">全部院区 (总院 + 东院)</option>
            <option value="总院区">总院区 (智慧手术中心)</option>
            <option value="东院区">东院区 (急危重症中心)</option>
          </select>
          <span>/</span>
          <span className="text-slate-900 font-medium">
            {activeTab === 'overview' && '采集盒批量巡检工作台'}
            {activeTab === 'batch_history' && '历史批量巡检记录台账'}
            {activeTab === 'diag_history' && '单项诊断与工单处理记录'}
            {activeTab === 'bindings' && '设备与线号映射 (表单维护)'}
            {activeTab === 'rules' && '设备型号规则库'}
            {activeTab === 'topology' && '物理与数据采集架构'}
          </span>
        </div>
      </div>

      {/* 右侧：快速操作栏 */}
      <div className="flex items-center gap-2.5">
        {/* 演示案例快速入口 */}
        <button
          onClick={onOpenDemoScenarios}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition shadow-xs"
          title="包含13个典型业务分支场景"
        >
          <Sliders className="w-3.5 h-3.5 text-amber-600" />
          <span>演示案例切换器 (13组经典分支)</span>
        </button>

        {/* 链路架构拓扑图 */}
        <button
          onClick={onOpenTopology}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition border border-slate-200"
          title="查看采集链路与两阶段执行规则"
        >
          <Layers className="w-3.5 h-3.5 text-slate-600" />
          <span>采集链路原理</span>
        </button>

        {/* 导出独立离线单HTML */}
        <button
          onClick={handleExportOfflineHtml}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition"
          title="生成独立单文件HTML，可发给甲方双击脱网运行"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>下载独立离线HTML</span>
        </button>

        {/* 批量巡检核心按钮 */}
        {activeTab === 'overview' && (
          <button
            onClick={onRunBatchInspection}
            disabled={isInspecting}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md text-white shadow-sm transition ${
              isInspecting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isInspecting ? 'animate-spin' : ''}`} />
            <span>{isInspecting ? '正在批量统计近5分钟DB...' : '一键批量巡检 (近5m DB)'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
