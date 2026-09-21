# -*- coding: utf-8 -*-
"""
华为ICT大赛 网络赛道 题库 v7b 扩充生成器（DCN 省赛专项）
- 背景：省资格赛/省复赛 DCN 占 20%，而此前按国赛( DCN=0 )优化导致 DCN 权重偏低
- 目标：把 DCN 占比拉回 ~20%，保证省赛出线
- 题型：以单选+多选为主（省赛不考判断）
- 输出：src/data/quizzes-extra-f.ts
注意：仅用于离线生成数据，不参与应用构建。
"""
import re
import os
import glob

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KNOWLEDGE_FILES = [
    os.path.join(REPO, 'src/data/knowledge.ts'),
    os.path.join(REPO, 'src/data/knowledge-extra.ts'),
]

def norm_text(s):
    return re.sub(r"[\s，。、；：（）()\"'？?！!·\-—]", "", s).lower()

def load_knowledge_ids():
    ids = set()
    for f in KNOWLEDGE_FILES:
        with open(f, encoding='utf-8') as fh:
            for line in fh:
                m = re.search(r"id:\s*'([^']+)'", line)
                if m:
                    ids.add(m.group(1))
    return ids

def load_existing_questions():
    texts = set()
    for f in glob.glob(os.path.join(REPO, 'src/data/quizzes*.ts')):
        if f.endswith('quizzes-extra-f.ts'):
            continue
        with open(f, encoding='utf-8') as fh:
            for line in fh:
                m = re.search(r"question:\s*'((?:[^'\\]|\\.)*)'", line)
                if m:
                    texts.add(norm_text(m.group(1)))
    return texts

KNOWN = load_knowledge_ids()
EXISTING = load_existing_questions()

Q = []
DIR_BY_PREFIX = {'datacom': 'datacom', 'security': 'security', 'wlan': 'wlan', 'dcn': 'dcn'}

def infer_direction(kid):
    for p, d in DIR_BY_PREFIX.items():
        if kid.startswith(p):
            return d
    return 'dcn'

def add(type_, q, *args, tag=None):
    if type_ == 'judge':
        answer = args[0]; exp = args[1]; kid = args[2]
        diff = args[3] if len(args) > 3 and args[3] else 'IP'
        if len(args) > 4: tag = args[4]
        options = []
    else:
        options = args[0]; answer = args[1]; exp = args[2]; kid = args[3]
        diff = args[4] if len(args) > 4 and args[4] else 'IP'
        if len(args) > 5: tag = args[5]
    Q.append(dict(type=type_, q=q, options=options, answer=answer, exp=exp,
                  kid=kid, diff=diff, tag=tag, direction=infer_direction(kid)))

# ======================================================================
# DCN（省赛 20%）——数据中心网络
# ======================================================================

# --- 数据中心网络架构 ---
add('single', '数据中心网络中，东西向流量指的是？', ['服务器之间的横向流量', '客户端到服务器的流量', '机房之间的流量', '出口南北向流量'],
    '服务器之间的横向流量', '东西向为服务器之间（横向）流量，数据中心内部占比高且逐年上升；南北向为客户端/外部到服务器的流量。', 'dcn-arch', 'IP', 'hot')
add('single', '传统三层数据中心网络（接入-汇聚-核心）的主要问题是？', ['收敛比高、链路利用率低，且依赖 STP 易成瓶颈', '不支持 VLAN', '不支持路由', '无法互联'],
    '收敛比高、链路利用率低，且依赖 STP 易成瓶颈', '传统三层架构存在带宽收敛、STP 阻断链路、扩展性受限等问题，难以满足云数据中心大带宽东西向需求。', 'dcn-arch', 'IP', 'hot')
add('single', '现代数据中心网络普遍采用的主流组网形态是？', ['Spine-Leaf（叶脊）Fabric 架构', '环形', '总线型', '单汇聚三层'],
    'Spine-Leaf（叶脊）Fabric 架构', 'Spine-Leaf 全互联、无阻塞、易横向扩展，配合 VXLAN/EVPN 构建大二层与多租户，是云数据中心主流。', 'dcn-arch', 'IP', 'hot')
add('single', '数据中心网络 Overlay 与 Underlay 的关系是？', ['Overlay 逻辑隧道叠加在 Underlay 物理网络之上', '二者相同', 'Underlay 叠加在 Overlay 上', '互不相关'],
    'Overlay 逻辑隧道叠加在 Underlay 物理网络之上', 'Underlay 提供 IP 可达的物理承载，Overlay（VXLAN）在其上构建逻辑大二层与租户隔离。', 'dcn-arch', 'IP', 'hot')
add('single', '数据中心中 ToR（Top of Rack）交换机的作用是？', ['接入同机柜内的服务器', '连接核心', '做出口网关', '做备份'],
    '接入同机柜内的服务器', 'ToR 部署在机柜顶部，汇聚本机柜服务器上联至 Leaf/汇聚，是服务器接入的常见形态。', 'dcn-arch', 'IP')
add('single', '数据中心网络对收敛比（超订比）的理想要求是？', ['1:1（无阻塞）', '1:10', '1:20', '越大越好'],
    '1:1（无阻塞）', '高性能数据中心追求无阻塞（1:1），Spine-Leaf 全互联配合 ECMP 可实现任意两点间无阻塞转发。', 'dcn-arch', 'IE', 'hot')
add('single', '数据中心网络实现链路级可靠与多活常用的技术是？', ['M-LAG / 堆叠（CSS/iStack）', 'STP', 'VLAN', 'RIP'],
    'M-LAG / 堆叠（CSS/iStack）', 'M-LAG 或堆叠可把双上行设备虚拟化为单一逻辑设备，实现多活转发、避免 STP 阻断，提升可靠性。', 'dcn-arch', 'IE', 'hot')
add('single', '关于数据中心网络的发展，下列说法错误的是？', ['传统三层架构比 Spine-Leaf 更适合大规模云数据中心', 'VXLAN 解决了大二层与租户隔离', 'EVPN 提供了可靠控制面', 'SDN 实现了自动化编排'],
    '传统三层架构比 Spine-Leaf 更适合大规模云数据中心', '大规模云数据中心更适合 Spine-Leaf + VXLAN/EVPN + SDN；传统三层存在收敛与扩展瓶颈。', 'dcn-arch', 'IP')
add('single', '数据中心 Fabric 架构中，统一编排与自动化通常由谁完成？', ['SDN 控制器（如 iMaster NCE-Fabric）', '核心交换机', '服务器', '防火墙'],
    'SDN 控制器（如 iMaster NCE-Fabric）', 'NCE-Fabric 等控制器负责 Fabric 的自动化部署、Overlay 编排与运维，实现网络即代码。', 'dcn-arch', 'IE', 'hot')
add('single', '数据中心互联（DCI）主要解决？', ['多个数据中心之间的高速互联与二层/三层延伸', '服务器供电', '机柜散热', '存储冗余'],
    '多个数据中心之间的高速互联与二层/三层延伸', 'DCI 用于多数据中心互联，支持双活/灾备，常配合 VXLAN/EVPN 实现跨站点二层延伸。', 'dcn-arch', 'IE')
add('single', '数据中心网络中"大二层"的主要诉求是？', ['让虚拟机在任意位置迁移时 IP 与网关不变', '减少 VLAN', '提升路由性能', '降低功耗'],
    '让虚拟机在任意位置迁移时 IP 与网关不变', '大二层打破三层边界，使 VM 迁移无需改 IP/网关，VXLAN 是实现大二层的核心技术。', 'dcn-arch', 'IE', 'hot')
add('single', '数据中心网络设计时，South-North 流量（南北向）的三个关键点是网络架构、安全防护与？', ['出口带宽与负载均衡', '机柜供电', '服务器型号', '磁盘容量'],
    '出口带宽与负载均衡', '南北向关注出口带宽、负载均衡与安全边界防护；东西向关注 Fabric 内部转发与微隔离。', 'dcn-arch', 'IP')

# --- VXLAN 基础 ---
add('single', 'VXLAN 的封装格式是？', ['MAC-in-UDP（原始以太帧封装进 UDP）', 'IP-in-IP', 'GRE', 'MAC-in-MAC（802.1ah）'],
    'MAC-in-UDP（原始以太帧封装进 UDP）', 'VXLAN 将原始二层帧封装进 UDP/IP，属于 MAC-in-UDP，默认 UDP 目的端口 4789。', 'dcn-vxlan-basic', 'IP', 'hot')
add('single', 'VXLAN VNI（网络标识符）占多少位，可支持的租户数量约为？', ['24 位，约 1600 万', '12 位，4094', '16 位，6.5 万', '32 位，40 亿'],
    '24 位，约 1600 万', 'VNI 为 24 位，理论支持约 1600 万个租户，远高于 VLAN 的 12 位（4094）。', 'dcn-vxlan-basic', 'IP', 'hot')
add('single', 'VTEP（VXLAN 隧道端点）的核心功能是？', ['对原始帧进行 VXLAN 封装/解封装', '分配 VNI', '做路由', '做 DHCP'],
    '对原始帧进行 VXLAN 封装/解封装', 'VTEP 位于 VXLAN 网络边缘，负责把二层帧封装进 VXLAN 隧道发送、并对收到的报文解封装。', 'dcn-vxlan-basic', 'IP', 'hot')
add('single', 'VXLAN 相比传统 VLAN 的核心优势不包括？', ['无需 IP 网络承载即可跨机房', '突破 4094 个 VLAN 数量限制', '支持租户隔离与大二层', '支持跨三层网络扩展二层'],
    '无需 IP 网络承载即可跨机房', 'VXLAN 恰恰依赖 IP（UDP）网络承载才能在跨三层环境中构建大二层；其优势是大二层、海量租户、租户隔离。', 'dcn-vxlan-basic', 'IE', 'hot')
add('single', 'VXLAN 中 BUM 流量（广播/未知单播/组播）的转发方式有？', ['组播复制与头端复制', '单播洪泛', '丢弃', '仅组播'],
    '组播复制与头端复制', 'BUM 流量依赖组播或头端复制（ingress replication）在隧道内泛洪；EVPN 后用 IMET 路由动态构建复制列表。', 'dcn-vxlan-basic', 'IE', 'hot')
add('single', 'VXLAN 报文默认使用的 UDP 目的端口是？', ['4789', '5246', '179', '4500'], '4789',
    'VXLAN 默认 UDP 目的端口 4789（IANA 分配），部分实现可自定义。', 'dcn-vxlan-basic', 'IP', 'real')
add('single', 'VXLAN 封装带来的额外开销（对 MTU 的要求）约为？', ['约 50 字节，需相应增大 MTU', '0 字节', '约 8 字节', '约 200 字节'],
    '约 50 字节，需相应增大 MTU', 'VXLAN 外层含 14B 以太 + 20B IP + 8B UDP + 8B VXLAN 头约 50 字节，故物理链路 MTU 需 ≥ 1550 左右。', 'dcn-vxlan-basic', 'IE', 'hot')
add('single', 'VXLAN 中"二层网关"的作用是？', ['实现 VXLAN 网络内不同网段（三层）之间的互通', '实现 VXLAN 与 VLAN 之间二层互通', '分配 VNI', '做防火墙'],
    '实现 VXLAN 网络内不同网段（三层）之间的互通', '二层网关完成 VXLAN-VXLAN（同网段）或 VXLAN-VLAN 的二层互通；三层网关负责不同网段的三层转发。', 'dcn-vxlan-basic', 'IE')
add('single', 'VXLAN 的 BD（Bridge Domain）在华为实现中对应？', ['广播域，VNI 与 BD 绑定', '路由域', '安全域', '管理域'],
    '广播域，VNI 与 BD 绑定', 'BD 是以太网广播域，华为以 BD 承载业务，与 VNI 一对一绑定后实现二层扩展。', 'dcn-vxlan-basic', 'IE')
add('single', 'VXLAN 网络中的 VTEP 地址通常是？', ['本设备的 Loopback 接口地址', '管理口地址', 'MAC 地址', '网关地址'],
    '本设备的 Loopback 接口地址', 'VTEP 源地址常取 Loopback（稳定、可路由），保证隧道两端可达并便于多路径。', 'dcn-vxlan-basic', 'IE', 'hot')
add('single', 'VXLAN 的"头端复制"（Head End Replication）是指？', ['入口 VTEP 将 BUM 报文分别单播复制到所有目的 VTEP', '由中间设备复制', '由组播复制', '不复制'],
    '入口 VTEP 将 BUM 报文分别单播复制到所有目的 VTEP', '头端复制由入口 VTEP 根据复制列表把 BUM 报文逐一分发到每个远端 VTEP，无需底层组播支持。', 'dcn-vxlan-basic', 'IE', 'hot')
add('single', 'VXLAN 中 VNI 与 VLAN 的关系是？', ['VNI 是 VXLAN 的租户标识，可与 VLAN 映射实现二层扩展', 'VNI 等于 VLAN ID', 'VNI 取代 IP', '二者无关'],
    'VNI 是 VXLAN 的租户标识，可与 VLAN 映射实现二层扩展', '本地 VLAN 映射到 VNI，VNI 在全网标识租户，实现跨三层的大二层与租户隔离。', 'dcn-vxlan-basic', 'IP', 'hot')
add('single', 'VXLAN 相比 GRE，其优势在于？', ['基于 UDP，便于 NAT 穿越与负载分担（ECMP）', '封装开销更小', '无需 IP', '不依赖路由'],
    '基于 UDP，便于 NAT 穿越与负载分担（ECMP）', 'VXLAN 基于 UDP，可做 ECMP 哈希负载分担、易穿越 NAT；GRE 为 IP 协议 47，负载分担与穿越性较差。', 'dcn-vxlan-basic', 'IE')
add('single', 'VXLAN 的 VNI 是在哪个字段中携带的？', ['VXLAN 头部', 'UDP 头部', 'IP 头部', '以太头部'],
    'VXLAN 头部', 'VXLAN 头部含 VNI（24 位）与标志位，位于 UDP 载荷内。', 'dcn-vxlan-basic', 'IP')
add('single', 'VXLAN 网络的"三层网关"负责？', ['不同 VNI/网段之间的三层转发', '二层互通', '隧道封装', 'BUM 复制'],
    '不同 VNI/网段之间的三层转发', '三层网关（集中式或分布式）为跨子网流量提供三层转发，并可作为统一网关。', 'dcn-vxlan-basic', 'IE')

# --- EVPN ---
add('single', 'EVPN 在数据中心网络中的主要作用是？', ['作为 VXLAN 的控制面，动态建立隧道与同步主机信息', '做数据面封装', '做二层网关', '做出口路由'],
    '作为 VXLAN 的控制面，动态建立隧道与同步主机信息', 'EVPN 基于 MP-BGP，用 BGP 路由同步 MAC/IP、VTEP 与多归信息，替代泛洪式控制面，提升可扩展性。', 'dcn-evpn', 'IE', 'hot')
add('single', 'EVPN 基于哪种协议传递路由？', ['MP-BGP', 'OSPF', 'IS-IS', 'RIP'], 'MP-BGP',
    'EVPN 使用 MP-BGP 扩展地址族（EVPN NLRI）传递各类 EVPN 路由（Type-1~5）。', 'dcn-evpn', 'IE', 'hot')
add('single', 'EVPN 中 Type-2 路由的作用是？', ['通告主机的 MAC 与 IP 地址', '选举 DF', '发现 VTEP', '通告 IP 前缀'],
    '通告主机的 MAC 与 IP 地址', 'Type-2（MAC/IP Advertisement）通告主机的 MAC（及可选 IP），实现控制面 MAC 学习与 ARP 抑制。', 'dcn-evpn', 'IE', 'hot')
add('single', 'EVPN 中 Type-3 路由（IMET）的作用是？', ['通告 VTEP 与头端复制列表（BUM 复制）', '通告 MAC', '选举 DF', '通告前缀'],
    '通告 VTEP 与头端复制列表（BUM 复制）', 'Type-3（Inclusive Multicast Ethernet Tag）用于自动发现 VTEP 并构建 BUM 流量的复制列表，替代泛洪。', 'dcn-evpn', 'IE', 'hot')
add('single', 'EVPN 中 Type-5 路由用于？', ['通告 IP 前缀路由（对接外部网络）', '通告 MAC', '选举 DF', '发现 VTEP'],
    '通告 IP 前缀路由（对接外部网络）', 'Type-5（IP Prefix Route）通告 IP 前缀，常用于 EVPN 与外部路由域互通或 L3VPN 场景。', 'dcn-evpn', 'IE')
add('single', 'EVPN 中 Type-1 路由（Ethernet Auto-Discovery）用于？', ['以太网段自动发现与多归场景的选路', '通告 MAC', '发现 VTEP', '通告前缀'],
    '以太网段自动发现与多归场景的选路', 'Type-1 用于以太网段自动发现与多归（All-Active/单活）选路，配合 ESI 标识多归接入。', 'dcn-evpn', 'IE')
add('single', 'EVPN 中 Type-4 路由（Ethernet Segment）的主要用途是？', ['选举多归接入的 DF（指定转发器）', '通告 MAC', '通告前缀', '发现 VTEP'],
    '选举多归接入的 DF（指定转发器）', 'Type-4 携带 ESI 与 DF 选举相关信息，用于多归场景中选出唯一负责转发的 PE。', 'dcn-evpn', 'IE')
add('single', 'EVPN 多归（Multi-homing）相比传统 M-LAG 的优势是？', ['基于控制面协议实现，跨设备标准化、易扩展', '配置更简单', '不需要 ESI', '不依赖 BGP'],
    '基于控制面协议实现，跨设备标准化、易扩展', 'EVPN 多归通过 BGP 与 ESI 实现跨厂商标准的多活接入，避免 M-LAG 的私有与规模限制。', 'dcn-evpn', 'IE')
add('single', 'EVPN 中 ESI（以太网段标识）的作用是？', ['标识同一 CE 多归接入的多个 PE 链路', '标识 VNI', '标识 VLAN', '标识 IP'],
    '标识同一 CE 多归接入的多个 PE 链路', '同一条多归链路在所有 PE 上配置相同 ESI，用于识别属于同一以太网段的成员，支撑 DF 选举与快速收敛。', 'dcn-evpn', 'IE')
add('single', 'EVPN 相比"组播 VXLAN"方案的核心优势是？', ['控制面动态建立复制列表，无需底层组播、可扩展性更好', '封装更小', '速度更快', '无需 BGP'],
    '控制面动态建立复制列表，无需底层组播、可扩展性更好', 'EVPN 用 BGP 同步信息并按需构建复制列表，摆脱对底层组播的依赖，适合大规模数据中心。', 'dcn-evpn', 'IE', 'hot')
add('single', 'EVPN 实例中，用于控制路由导入导出的属性是？', ['RT（Route Target）', 'RD', 'ESI', 'VNI'],
    'RT（Route Target）', 'RT 控制 EVPN 路由在不同 EVPN 实例间的导入/导出，实现租户隔离；RD 用于区分相同前缀。', 'dcn-evpn', 'IE')
add('single', 'EVPN 的"抑制 ARP 泛洪"主要依赖哪种路由？', ['Type-2（携带 IP 信息时）', 'Type-3', 'Type-1', 'Type-4'],
    'Type-2（携带 IP 信息时）', 'Type-2 可携带主机 IP（ARP 表项），PE 据控制面代理 ARP 响应，减少 ARP 泛洪。', 'dcn-evpn', 'IE')
add('single', 'EVPN 的 RD（路由区分符）作用是？', ['区分不同 VRF 中相同的路由前缀', '控制导入导出', '标识多归', '标识 VNI'],
    '区分不同 VRF 中相同的路由前缀', 'RD 使不同 VPN 实例中相同的 IP 前缀在 BGP 中唯一，与 RT 配合实现 VPN 路由隔离。', 'dcn-evpn', 'IE')
add('single', 'EVPN 中 DF（指定转发器）的选举目的是？', ['在多归场景下避免 BUM 流量重复转发', '选举网关', '选举根桥', '分配 IP'],
    '在多归场景下避免 BUM 流量重复转发', '多归接入中多条链路同时连到 CE，DF 选举确保只有一个 PE 转发 BUM 流量，避免重复。', 'dcn-evpn', 'IE')
add('single', 'EVPN 在数据中心的典型部署是与哪种技术配合？', ['VXLAN', 'MPLS L2VPN', 'GRE', 'IPSec'],
    'VXLAN', '数据中心最常见的是 VXLAN + EVPN：VXLAN 负责数据面封装，EVPN 提供控制面。', 'dcn-evpn', 'IP', 'hot')
add('single', 'EVPN 支持的多归模式不包括？', ['NAT 多归', 'All-Active（全活）', 'Single-Active（单活）', 'Port-Active'],
    'NAT 多归', 'EVPN 多归模式包括 All-Active、Single-Active、Port-Active；NAT 不是多归模式。', 'dcn-evpn', 'IE')

# --- SDN 基础 ---
add('single', 'SDN（软件定义网络）的核心思想是？', ['控制平面与数据平面分离', '增加带宽', '加密流量', '简化布线'],
    '控制平面与数据平面分离', 'SDN 将控制逻辑集中到控制器，转发设备只负责转发，实现集中管控与可编程。', 'dcn-sdn-basic', 'IP', 'hot')
add('single', 'SDN 的三层架构不包括？', ['物理层', '应用层', '控制层', '转发层'],
    '物理层', 'SDN 三层：应用层（编排）、控制层（控制器）、转发层（设备）；通过北向/南向接口交互。', 'dcn-sdn-basic', 'IP', 'hot')
add('single', 'SDN 中，控制器与转发设备之间的接口称为？', ['南向接口', '北向接口', '东西向接口', '管理接口'],
    '南向接口', '南向接口面向设备（如 OpenFlow、NETCONF），北向接口面向应用/编排（RESTful API）。', 'dcn-sdn-basic', 'IP', 'hot')
add('single', 'OpenFlow 协议在 SDN 中的定位是？', ['典型的南向接口协议', '北向接口', '管理协议', '路由协议'],
    '典型的南向接口协议', 'OpenFlow 是控制器与交换机之间的南向协议，定义流表下发与转发行为。', 'dcn-sdn-basic', 'IP', 'hot')
add('single', 'SDN 中"北向接口"通常采用哪种形式？', ['RESTful API', 'OpenFlow', 'LLDP', 'BGP'],
    'RESTful API', '北向接口多采用 RESTful API，供上层应用/编排系统调用控制器能力。', 'dcn-sdn-basic', 'IP')
add('single', 'OpenFlow 流表的核心作用是？', ['定义报文的匹配规则与转发动作', '分配 IP', '加密数据', '选举根桥'],
    '定义报文的匹配规则与转发动作', '流表由匹配字段与指令/动作组成，实现基于流的灵活转发与策略。', 'dcn-sdn-basic', 'IP')
add('single', 'NETCONF/YANG 在 SDN 中的作用是？', ['提供标准化的网络配置管理模型与协议', '数据封装', '路由计算', '以太网供电'],
    '提供标准化的网络配置管理模型与协议', 'NETCONF 为配置协议、YANG 为数据建模语言，二者支撑自动化配置与模型化管理。', 'dcn-sdn-basic', 'IE', 'hot')
add('single', 'SDN 相比传统网络的主要优势不包括？', ['设备无需任何转发能力', '集中管控与可视化', '自动化与快速业务开通', '可编程与开放'],
    '设备无需任何转发能力', 'SDN 设备仍需高性能转发能力，只是把控制逻辑上移；其优势在集中管控、自动化、可编程。', 'dcn-sdn-basic', 'IP')
add('single', '数据中心 SDN 落地的典型产品是？', ['华为 iMaster NCE-Fabric', 'VRRP', 'VXLAN 网关', 'STP'],
    '华为 iMaster NCE-Fabric', 'NCE-Fabric 面向数据中心 Fabric，提供自动化部署、Overlay 编排与统一运维。', 'dcn-sdn-basic', 'IE', 'hot')
add('single', 'SDN 控制器的主要职责不包括？', ['转发数据报文', '下发流表与策略', '拓扑收集与计算', '开放接口供应用调用'],
    '转发数据报文', '控制器负责集中决策、下发策略、维护拓扑与开放能力；实际数据转发由转发设备完成。', 'dcn-sdn-basic', 'IP')
add('single', 'SDN 的两种主要实现模式是？', ['Overlay 模式与 Underlay 模式', '网管模式与命令行模式', '集中式与分布式路由', '二层与三层'],
    'Overlay 模式与 Underlay 模式', 'Overlay（如 Fabric 控制器管 VXLAN 叠加层）与 Underlay（控制器直管物理设备）是两种常见落地模式。', 'dcn-sdn-basic', 'IE')
add('single', '关于 SDN 控制器可靠性，通常采用什么方案？', ['集群/主备部署', '单机部署', '不部署', '仅备用'],
    '集群/主备部署', '控制器是大脑，需集群或主备保证高可用，避免单点故障导致全网失控。', 'dcn-sdn-basic', 'IP')

# --- Spine-Leaf 架构 ---
add('single', 'Spine-Leaf 架构中，任意两台 Leaf 之间的通信经过几跳？', ['两跳（Leaf-Spine-Leaf）', '一跳', '三跳', '不确定'],
    '两跳（Leaf-Spine-Leaf）', 'Leaf 只与 Spine 互连、Spine 之间不互连，任意两 Leaf 之间固定两跳，转发时延可预期。', 'dcn-clos', 'IP', 'hot')
add('single', 'Spine-Leaf 架构中，服务器与交换机的最佳连接方式是？', ['服务器双上联到两台 Leaf', '服务器单上联', '服务器直连 Spine', '服务器连汇聚'],
    '服务器双上联到两台 Leaf', '服务器双上联到不同 Leaf 配合 M-LAG/EVPN 多归，实现链路冗余与负载分担。', 'dcn-clos', 'IP')
add('single', 'Clos 网络架构的核心优势是？', ['可扩展、无阻塞、易水平扩容', '节省光纤', '简化配置', '降低功耗'],
    '可扩展、无阻塞、易水平扩容', 'Clos（叶脊）通过全互联与 ECMP 实现无阻塞转发与线性扩展，是数据中心 Fabric 的基础。', 'dcn-clos', 'IE', 'hot')
add('single', 'Spine-Leaf 中实现多路径负载分担依赖的技术是？', ['ECMP（等价多路径）', 'STP', 'VRRP', 'DHCP'],
    'ECMP（等价多路径）', 'Leaf 到 Spine 多条等价链路通过 ECMP 哈希分担流量，提升带宽利用率。', 'dcn-clos', 'IP', 'hot')
add('single', '关于 Spine-Leaf 的扩展方式，下列说法正确的是？', ['横向增加 Spine 或 Leaf 即可扩容', '只能纵向升级单台设备', '不能扩展', '必须整体重建'],
    '横向增加 Spine 或 Leaf 即可扩容', 'Spine-Leaf 支持横向扩展：加 Leaf 扩容接入、加 Spine 扩容带宽，无需重构。', 'dcn-clos', 'IP')
add('single', 'Spine 交换机之间通常？', ['不直接互连', '必须全互联', '通过 Leaf 互连', '用 STP 互联'],
    '不直接互连', '标准 Spine-Leaf 中 Spine 之间不互连，以便任意两 Leaf 固定两跳、路径确定。', 'dcn-clos', 'IP', 'hot')
add('single', '数据中心 Fabric 中"无阻塞"通常指？', ['全带宽互联，超订比接近 1:1', '不转发', '仅上行', '仅下行'],
    '全带宽互联，超订比接近 1:1', '无阻塞要求上下行带宽匹配（1:1），避免内部链路成为瓶颈。', 'dcn-clos', 'IE')
add('single', 'Spine-Leaf 架构中，Leaf 交换机的主要角色是？', ['接入服务器并作为 VTEP/网关', '核心转发', '出口', '备份'],
    '接入服务器并作为 VTEP/网关', 'Leaf 接入服务器、承载 VXLAN VTEP 与网关；Spine 提供高速互联与 ECMP 转发。', 'dcn-clos', 'IE', 'hot')
add('single', '大型数据中心 Fabric 扩展到更大规模时，常采用几级 Clos？', ['三级或五级 Clos', '一律两级', '仅一级', '无需 Clos'],
    '三级或五级 Clos', '超大规模时用三级/五级 Clos 分层扩展，保持无阻塞与可扩展性。', 'dcn-clos', 'IE')
add('single', 'Spine-Leaf 的流量模型特点是？', ['东西向流量为主，且Leaf间流量经Spine转发', '南北向为主', '仅东西向不经 Spine', '无规律'],
    '东西向流量为主，且Leaf间流量经Spine转发', '数据中心东西向流量占比高，Leaf 间通信统一经 Spine 转发，路径可预测。', 'dcn-clos', 'IP')

# --- VXLAN 网关 ---
add('single', 'VXLAN 集中式网关与分布式网关的核心区别是？', ['集中式网关由少数设备承担网关，分布式网关由每台 Leaf 就近承担', '二者相同', '分布式网关更慢', '集中式更易扩展'],
    '集中式网关由少数设备承担网关，分布式网关由每台 Leaf 就近承担', '集中式网关部署简单但流量集中易成瓶颈；分布式网关各 Leaf 就近三层转发，路径最优、可扩展。', 'dcn-vxlan-gateway', 'IE', 'hot')
add('single', '分布式网关（Distributed Gateway）中，Anycast 网关的作用是？', ['多台 Leaf 使用相同的网关 IP/MAC，实现就近三层转发', '分配新 IP', '做 NAT', '做防火墙'],
    '多台 Leaf 使用相同的网关 IP/MAC，实现就近三层转发', 'Anycast 网关让每个 Leaf 都具备相同网关地址，VM 就近完成三层转发，避免绕行集中网关。', 'dcn-vxlan-gateway', 'IE', 'hot')
add('single', '分布式网关中，ARP 表项如何同步到其他 Leaf？', ['通过 EVPN Type-2 路由同步', '通过 STP', '通过 DHCP', '不同步'],
    '通过 EVPN Type-2 路由同步', '分布式网关借助 EVPN Type-2 同步主机 MAC/IP 与 ARP，实现任意 Leaf 都能就近转发。', 'dcn-vxlan-gateway', 'IE', 'hot')
add('single', '集中式网关的主要缺点是？', ['三层流量集中在网关设备，易成瓶颈且路径非最优', '配置复杂', '不支持 VXLAN', '不能互通'],
    '三层流量集中在网关设备，易成瓶颈且路径非最优', '集中式网关下跨子网流量需绕行网关，形成流量瓶颈与次优路径。', 'dcn-vxlan-gateway', 'IE', 'hot')
add('single', 'VXLAN 二层网关的作用是？', ['实现 VXLAN 与 VLAN、或同网段 VXLAN 间的二层互通', '三层转发', '分配 VNI', '做 NAT'],
    '实现 VXLAN 与 VLAN、或同网段 VXLAN 间的二层互通', '二层网关负责同网段的二层打通（如 VXLAN 与外部 VLAN 对接）。', 'dcn-vxlan-gateway', 'IE')
add('single', '分布式网关场景下，跨子网通信的转发路径是？', ['源 Leaf 就近完成三层转发后经隧道送到目的 Leaf', '必须绕行集中网关', '经出口防火墙', '经核心'],
    '源 Leaf 就近完成三层转发后经隧道送到目的 Leaf', '分布式网关下源 Leaf 直接完成三层查表并封装隧道，直达目的 Leaf，路径最短。', 'dcn-vxlan-gateway', 'IE', 'hot')
add('single', 'VXLAN 网关设备通常部署在？', ['Leaf 或单独的服务/边界设备', '服务器', '机柜', '终端'],
    'Leaf 或单独的服务/边界设备', '分布式网关部署在 Leaf 上；集中式网关可部署在独立设备或边界 Leaf/服务节点上。', 'dcn-vxlan-gateway', 'IP')
add('single', '关于 VXLAN 网关的 VNI 与 BD 映射，正确的是？', ['VNI 与 BD 一一绑定，BD 关联二层业务', 'VNI 与 VLAN 相同', 'BD 与 IP 绑定', '无映射'],
    'VNI 与 BD 一一绑定，BD 关联二层业务', '华为实现中，VNI 与 BD 一一对应，BD 承载二层广播域，网关关联 BDIF 实现三层。', 'dcn-vxlan-gateway', 'IE')

# --- SDN 控制器与编排 ---
add('single', 'iMaster NCE-Fabric 面向的场景是？', ['数据中心网络自动化与 Fabric 编排', '园区无线', '广域网', '家庭网络'],
    '数据中心网络自动化与 Fabric 编排', 'NCE-Fabric 面向数据中心，提供 Fabric 自动化部署、Overlay 编排与运维分析。', 'dcn-sdn-controller', 'IE', 'hot')
add('single', 'SDN 控制器实现 Fabric 自动化的关键能力是？', ['一键下发 Underlay 与 Overlay 配置并自动建链', '仅告警', '仅监控', '仅备份'],
    '一键下发 Underlay 与 Overlay 配置并自动建链', '控制器通过南向协议自动完成设备纳管、Underlay 配置与 Overlay 隧道编排，大幅降低人工。', 'dcn-sdn-controller', 'IE', 'hot')
add('single', 'iMaster NCE 的开放能力通常通过什么提供给上层？', ['北向 RESTful API', 'OpenFlow 南向', '命令行', 'SNMP'],
    '北向 RESTful API', '控制器通过北向 RESTful API 向编排/云平台开放网络能力，实现网络即服务。', 'dcn-sdn-controller', 'IE')
add('single', 'SDN 控制器纳管设备通常使用哪些南向协议？', ['NETCONF/OpenFlow 等', '仅 SNMP', '仅 Telnet', '仅 FTP'],
    'NETCONF/OpenFlow 等', '南向常用 NETCONF（配置）、OpenFlow（转发控制）等协议纳管与下发。', 'dcn-sdn-controller', 'IE')
add('single', '关于 SDN 控制器的"网络即代码"，正确的是？', ['通过 API/模板把网络配置自动化、版本化管理', '用代码加密流量', '用代码分配 IP', '用代码布线'],
    '通过 API/模板把网络配置自动化、版本化管理', '网络即代码指用模板/API 描述并自动化下发网络配置，支持版本管理与可重复部署。', 'dcn-sdn-controller', 'IE')
add('single', '数据中心 Fabric 自动化部署的第一步通常是？', ['设备纳管与角色/拓扑发现', '配置 VXLAN', '配置路由', '配置 ACL'],
    '设备纳管与角色/拓扑发现', '控制器先纳管设备、识别角色与拓扑，再自动化下发 Underlay/Overlay 配置。', 'dcn-sdn-controller', 'IE', 'hot')
add('single', 'SDN 控制器实现故障快速定位主要依赖？', ['Telemetry 遥测与可视化分析', '人工排查', '命令行', '日志文件'],
    'Telemetry 遥测与可视化分析', 'Telemetry 高速采集网络数据，控制器可视化分析实现秒级故障定位。', 'dcn-sdn-controller', 'IE')
add('single', 'SDN 在数据中心的典型价值不包括？', ['替代所有转发硬件', '业务分钟级开通', '统一管理与可视化', '自动化运维'],
    '替代所有转发硬件', 'SDN 提升自动化与运维效率，但不替代转发硬件本身。', 'dcn-sdn-controller', 'IE')
add('single', '关于控制器集群的高可用，下列说法正确的是？', ['多节点集群，单点故障不影响整体服务', '单节点即可', '无需备份', '仅冷备'],
    '多节点集群，单点故障不影响整体服务', '控制器集群通过多节点冗余保证高可用，成员故障时服务不中断。', 'dcn-sdn-controller', 'IE')

# ============================ 校验与输出 ============================
def ts_escape(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def validate():
    for q in Q:
        if q['kid'] not in KNOWN:
            print('[WARN] 未知 knowledgeId:', q['kid'], '|', q['q'][:30])
        if q['type'] in ('single', 'multiple'):
            opts = q['options']; ans = q['answer']
            if isinstance(ans, list):
                for a in ans:
                    if a not in opts:
                        print('[ERR] 多选答案不在选项中:', q['q'][:30], a)
            else:
                if ans not in opts:
                    print('[ERR] 单选答案不在选项中:', q['q'][:30], ans)

def emit(path):
    seen = set(EXISTING)
    uniq = []
    for q in Q:
        k = norm_text(q['q'])
        if k in seen:
            print('[SKIP] 与现有题库重复:', q['q'][:30])
            continue
        seen.add(k)
        uniq.append(q)
    counters = {'datacom': 0, 'security': 0, 'wlan': 0, 'dcn': 0}
    dir_code = {'datacom': 'dc', 'security': 'se', 'wlan': 'wl', 'dcn': 'dn'}
    lines = ["// 自动生成：华为ICT大赛网络赛道题库 v7b 扩充（DCN 省赛专项，补齐省赛 20% 权重）",
             "// 由 scripts/gen_questions_v7b.py 离线生成，请勿手工编辑",
             "import type { IQuizQuestion } from './quizzes'",
             "",
             "export const EXTRA_QUIZZES_F: IQuizQuestion[] = ["]
    for q in uniq:
        counters[q['direction']] += 1
        nid = f"nx8-{dir_code[q['direction']]}-{counters[q['direction']]:03d}"
        tag = f", tag: '{q['tag']}'" if q.get('tag') else ""
        if q['type'] == 'judge':
            ans = '正确' if q['answer'] is True else '错误'
            body = (f"  {{\n    id: '{nid}',\n    type: 'judge',\n"
                    f"    question: '{ts_escape(q['q'])}',\n"
                    f"    options: ['正确', '错误'],\n    answer: '{ans}',\n"
                    f"    explanation: '{ts_escape(q['exp'])}',\n"
                    f"    knowledgeId: '{q['kid']}',\n    direction: '{q['direction']}',"
                    f" difficulty: '{q['diff']}'{tag},\n  }},")
        else:
            opts = "[" + ", ".join(f"'{ts_escape(o)}'" for o in q['options']) + "]"
            if isinstance(q['answer'], list):
                ans = "[" + ", ".join(f"'{ts_escape(a)}'" for a in q['answer']) + "]"
            else:
                ans = f"'{ts_escape(q['answer'])}'"
            body = (f"  {{\n    id: '{nid}',\n    type: '{q['type']}',\n"
                    f"    question: '{ts_escape(q['q'])}',\n    options: {opts},\n"
                    f"    answer: {ans},\n    explanation: '{ts_escape(q['exp'])}',\n"
                    f"    knowledgeId: '{q['kid']}',\n    direction: '{q['direction']}',"
                    f" difficulty: '{q['diff']}'{tag},\n  }},")
        lines.append(body)
    lines.append("];")
    with open(path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    print(f"[OK] 写出 {len(uniq)} 题 -> {path}")

if __name__ == '__main__':
    validate()
    emit(os.path.join(REPO, 'src/data/quizzes-extra-f.ts'))
