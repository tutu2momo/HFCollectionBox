/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Network, 
  ArrowRight, 
  Server, 
  Database, 
  Cpu, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export const ArchitectureTopologyView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* 头部说明 */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1.5">
          <Network className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            医疗物联网采集全链路原理与两阶段业务规则
          </h2>
          <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full font-mono">
            V1.0 架构白皮书
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          本系统针对智慧手术室与ICU高并发医疗设备采集场景设计。通过严格区分<strong>第一阶段批量巡检</strong>与<strong>第二阶段单项诊断</strong>，杜绝“一键全网Ping风暴”导致临床网络中断，杜绝“将空载当故障”，确保运维责任边界严谨清晰。
        </p>
      </div>

      {/* 架构拓扑流程卡片图 */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>完整物理与数据流向拓扑 (从病床端到临床应用)</span>
          <span className="text-[11px] text-slate-400 font-normal">单向/双向会话隔离</span>
        </div>

        {/* 流程拓扑图 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* 节点 1 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-2">
                1
              </div>
              <div className="font-bold text-xs text-slate-900">医疗仪器设备</div>
              <div className="text-[11px] text-slate-500 mt-0.5">监护仪 / 麻醉机 / 呼吸机</div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-white p-2 rounded border border-slate-100">
                通过串口 (RS232/485) 或局域网口输出专用协议原始帧。
              </p>
            </div>
            <div className="mt-3 text-[10px] text-slate-400">
              * 设备未开机或处于Standby则下行静默
            </div>
          </div>

          {/* 节点 2 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mb-2">
                2
              </div>
              <div className="font-bold text-xs text-slate-900">采集盒下行口 (recv)</div>
              <div className="text-[11px] text-slate-500 mt-0.5">物理转接线与端口缓冲</div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-white p-2 rounded border border-slate-100">
                <strong>recv &gt; 0</strong> 表示下行口抓到报文；但不能等同于数据库有数据！
              </p>
            </div>
            <div className="mt-3 text-[10px] text-amber-700">
              * 1个盒子可绑定L01、L02多条线号
            </div>
          </div>

          {/* 节点 3 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-2">
                3
              </div>
              <div className="font-bold text-xs text-slate-900">采集盒微内核</div>
              <div className="text-[11px] text-slate-500 mt-0.5">驱动配置与上行打包</div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-white p-2 rounded border border-slate-100">
                负责 <strong>fopen</strong> 配置、<strong>fclose</strong> 落盘、<strong>attach</strong> 绑定串口驱动。
              </p>
            </div>
            <div className="mt-3 text-[10px] text-indigo-700">
              * attach OK 仅代表配置流程通
            </div>
          </div>

          {/* 节点 4 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-2">
                4
              </div>
              <div className="font-bold text-xs text-slate-900">物联网网关平台</div>
              <div className="text-[11px] text-slate-500 mt-0.5">协议解析 / 过滤 / 时序入库</div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-white p-2 rounded border border-slate-100">
                执行 HL7 / Medibus 报文解码；无患者空载包按规则过滤或写入。
              </p>
            </div>
            <div className="mt-3 text-[10px] text-emerald-700">
              * 负责第一阶段批量统计API
            </div>
          </div>

          {/* 节点 5 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-2">
                5
              </div>
              <div className="font-bold text-xs text-slate-900">数据库与业务系统</div>
              <div className="text-[11px] text-slate-500 mt-0.5">时序库 / 麻醉系统 / EMR</div>
              <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-white p-2 rounded border border-slate-100">
                存储近 5 分钟体征点数与时间戳；供医生术中监护与病历归档。
              </p>
            </div>
            <div className="mt-3 text-[10px] text-purple-700">
              * 巡检唯一只读数据源
            </div>
          </div>
        </div>
      </div>

      {/* 两阶段业务规则对比核心卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 第一阶段规则 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <h3 className="font-bold text-sm text-slate-900">
              第一阶段：一键批量巡检 (高频全局扫描)
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 rounded bg-blue-50/60 border border-blue-200 text-blue-950 font-medium">
              ⚡ <strong>核心机制</strong>：用户选择范围后点击一次主按钮，<strong>只对范围内所有线号批量查询数据库近 5 分钟数据量和最后数据时间</strong>，异步增量刷新！
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-rose-600 font-bold shrink-0">✕ 绝对红线：</span>
                <span>严禁在巡检阶段自动执行 Ping、连接采集盒、fopen、fclose、attach 或 recv 诊断！避免对正在手术的采集盒造成网络抖动或配置冲正。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓ 结论分类：</span>
                <span>输出“采集正常、无数据待诊断、部分线无数据、查询失败、绑定不完整”。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">! 判据严谨：</span>
                <span>数据库查询失败不能说成无数据，无数据不能直接断定为设备故障。</span>
              </div>
            </div>
          </div>
        </div>

        {/* 第二阶段规则 */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <span className="w-3 h-3 rounded-full bg-amber-600"></span>
            <h3 className="font-bold text-sm text-slate-900">
              第二阶段：单项诊断 (精准靶向深入)
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3 rounded bg-amber-50/60 border border-amber-200 text-amber-950 font-medium">
              🔍 <strong>核心机制</strong>：仅针对“无数据待诊断”或“部分线无数据”的特定线号，由用户人工点击“开始诊断”从右侧调出抽屉执行。
            </div>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-purple-600 font-bold shrink-0">① 同盒先行：</span>
                <span>先查同盒其他线号。若其他线号近 5 分钟有数据，<strong>自动跳过 Ping 并标明“同盒其他线号有数据，具备在线证据”</strong>；全部无数据才 Ping。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold shrink-0">② 证据链条：</span>
                <span>Ping 通后，依次检查：读取线号 → fopen → 配置下发 → fclose → attach → recv。某一步失败后续一律标为“未执行”，禁标“失败”。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-600 font-bold shrink-0">③ 患者确认：</span>
                <span>attach OK 且 recv &gt; 0 但近 5 分钟无入库时，<strong>必须弹窗让现场确认患者使用状态</strong>，有患者才转网关，无患者属闲置正常。</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 专有名词与状态含义说明表 */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
          核心技术指令与状态语义严密定义
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-medium">
              <th className="py-2.5 px-4 w-40">专有名词 / 指令</th>
              <th className="py-2.5 px-4 w-52">执行操作与技术实质</th>
              <th className="py-2.5 px-4">成功代表的意义</th>
              <th className="py-2.5 px-4 text-rose-600">绝不能推导出的错误结论</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-blue-700">fopen</td>
              <td className="py-3 px-4">打开 &lt;线号&gt;.json 描述文件</td>
              <td className="py-3 px-4">采集盒存在该线号的配置文件描述符</td>
              <td className="py-3 px-4 text-rose-700 font-medium">不代表协议参数已被驱动生效</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-blue-700">配置下发</td>
              <td className="py-3 px-4">网关推送解析参数表并校验</td>
              <td className="py-3 px-4">波特率与报文过滤规则正确传输至盒子</td>
              <td className="py-3 px-4 text-rose-700 font-medium">不代表物理串口已打开</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-blue-700">fclose</td>
              <td className="py-3 px-4">保存配置文件并释放句柄</td>
              <td className="py-3 px-4">配置成功固化落盘到 Flash</td>
              <td className="py-3 px-4 text-rose-700 font-medium">不代表医疗设备已接入</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-blue-700">attach</td>
              <td className="py-3 px-4">应用下行串口或网口驱动</td>
              <td className="py-3 px-4">下行端口开启监听，FIFO 接收缓冲分配完成</td>
              <td className="py-3 px-4 text-rose-700 font-medium">仅代表配置通走，绝对不代表设备正在发有效数据！</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-mono font-bold text-blue-700">recv &gt; 0</td>
              <td className="py-3 px-4">采集盒下行物理口捕获到数据帧</td>
              <td className="py-3 px-4">医疗设备向转接线发送了物理电平/协议字节</td>
              <td className="py-3 px-4 text-rose-700 font-medium">绝不能等同于数据库有数据！可能是空载心跳或被网关阻塞</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
