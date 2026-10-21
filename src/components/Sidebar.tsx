/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  History, 
  Cpu, 
  BookOpen, 
  Network, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Radio
} from 'lucide-react';
import { MedicalDevice } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  devices: MedicalDevice[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  devices
}) => {
  // 实时聚合统计
  const totalDevs = devices.length;
  const normalCount = devices.filter(d => d.aggregateStatus === 'NORMAL').length;
  const partialCount = devices.filter(d => d.aggregateStatus === 'PARTIAL_NO_DATA').length;
  const noDataCount = devices.filter(d => d.aggregateStatus === 'ALL_NO_DATA').length;
  const queryErrCount = devices.filter(d => d.aggregateStatus === 'QUERY_ERROR').length;
  const unbindCount = devices.filter(d => d.aggregateStatus === 'BINDING_INCOMPLETE').length;

  const navItems = [
    {
      id: 'overview',
      label: '采集盒批量巡检',
      badge: '主工作台',
      icon: LayoutDashboard,
      desc: '以采集盒为主视图，巡检前后对比'
    },
    {
      id: 'batch_history',
      label: '历史巡检记录',
      badge: '批次总结',
      icon: History,
      desc: '历史巡检总结正常与异常数据'
    },
    {
      id: 'diag_history',
      label: '诊断与处理记录',
      badge: '闭环审计',
      icon: ShieldCheck,
      desc: '以采集盒为主展示历次诊断记录与结果'
    },
    {
      id: 'bindings',
      label: '设备与线号映射',
      badge: '表单管理',
      icon: Cpu,
      desc: '表单化绑定编辑与通道维护'
    },
    {
      id: 'rules',
      label: '型号规则知识库',
      badge: '规则',
      icon: BookOpen,
      desc: '无患者闲置报文与入库策略'
    },
    {
      id: 'topology',
      label: '采集链路与原理',
      badge: '架构',
      icon: Network,
      desc: '盒子/网关/数据库拓扑与步骤定义'
    }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none z-30">
      {/* 顶部 Brand */}
      <div className="h-14 px-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-base">
          <Radio className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-semibold text-sm text-white tracking-tight flex items-center gap-1.5">
            医疗物联网巡检
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">V1.0</span>
          </div>
          <div className="text-[11px] text-slate-400">两阶段精准运维工作台</div>
        </div>
      </div>

      {/* 导航菜单 */}
      <div className="px-3 py-4 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          功能矩阵
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isActive ? 'bg-blue-700/60 text-blue-100' : 'bg-slate-800 text-slate-400'
              }`}>
                {item.badge}
              </span>
            </button>
          );
        })}

        {/* 状态监控快速总览 */}
        <div className="pt-6 px-3">
          <div className="mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>实时链路状态</span>
            <span className="text-[10px] text-slate-400 font-mono">近5m入库</span>
          </div>
          <div className="space-y-1.5 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                采集正常
              </span>
              <span className="font-mono text-emerald-400 font-semibold">{normalCount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                部分线无数据
              </span>
              <span className="font-mono text-amber-400 font-semibold">{partialCount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                全部无数据待诊断
              </span>
              <span className="font-mono text-rose-400 font-semibold">{noDataCount}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>查询异常/缺失</span>
              <span className="font-mono">{queryErrCount + unbindCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部业务规则提醒卡片 */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="bg-slate-900/90 border border-slate-800 rounded-md p-2.5 text-[11px] text-slate-400 leading-relaxed">
          <div className="text-blue-400 font-semibold mb-1 flex items-center gap-1">
            <span>🛡️ 规则铁律 (禁止混淆)</span>
          </div>
          <p>
            • <strong className="text-slate-300">一键巡检</strong>：仅批量查近5分DB入库，禁自动Ping与连盒子。<br />
            • <strong className="text-slate-300">单项诊断</strong>：同盒它线有数据跳过Ping；无数据才Ping。
          </p>
        </div>
      </div>
    </aside>
  );
};
