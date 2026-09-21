# -*- coding: utf-8 -*-
"""
华为ICT大赛 网络赛道 题库扩充生成器（第十届/实践赛，对齐官方考纲权重）
- 输入：手工编写的"事实库"（题目文本由人把关，保证准确性）
- 输出：src/data/quizzes-extra-d.ts （标准 IQuizQuestion[]）
- 校验：所有 knowledgeId 必须存在于 knowledge.ts / knowledge-extra.ts
- 去重：题干完全相同的只保留一条
注意：本脚本仅用于离线生成数据，不参与应用构建。
"""
import re
import os

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KNOWLEDGE_FILES = [
    os.path.join(REPO, 'src/data/knowledge.ts'),
    os.path.join(REPO, 'src/data/knowledge-extra.ts'),
]

def load_knowledge_ids():
    ids = set()
    for f in KNOWLEDGE_FILES:
        with open(f, encoding='utf-8') as fh:
            for line in fh:
                m = re.search(r"id:\s*'([^']+)'", line)
                if m:
                    ids.add(m.group(1))
    return ids

KNOWN = load_knowledge_ids()

Q = []

DIR_BY_PREFIX = {'datacom': 'datacom', 'security': 'security', 'wlan': 'wlan', 'dcn': 'dcn'}

def infer_direction(kid):
    for p, d in DIR_BY_PREFIX.items():
        if kid.startswith(p):
            return d
    return 'datacom'

def add(type_, q, *args, tag=None):
    if type_ == 'judge':
        # 用法：add('judge', q, bool_answer, explanation, kid, diff='IA', tag=None)
        answer = args[0]
        exp = args[1]
        kid = args[2]
        diff = args[3] if len(args) > 3 and args[3] else 'IA'
        if len(args) > 4:
            tag = args[4]
        options = []
    else:
        # 用法：add('single'/'multiple', q, options, answer, explanation, kid, diff='IA', tag=None)
        options = args[0]
        answer = args[1]
        exp = args[2]
        kid = args[3]
        diff = args[4] if len(args) > 4 and args[4] else 'IA'
        if len(args) > 5:
            tag = args[5]
    Q.append(dict(type=type_, q=q, options=options, answer=answer, exp=exp,
                  kid=kid, diff=diff, tag=tag, direction=infer_direction(kid)))

# ----------------------------------------------------------------------
# 数通方向（国赛 50% 权重，重点铺开）
# ----------------------------------------------------------------------

# --- OSPF ---
add('single', 'OSPF 协议中，骨干区域的编号是？', ['Area 0', 'Area 1', 'Area 100', 'Area 255'], 'Area 0',
    'OSPF 要求所有非骨干区域（非 0 区域）必须与骨干区域 Area 0 直接相连，Area 0 是唯一骨干。', 'datacom-ospf', 'IA', 'hot')
add('single', 'OSPF 使用的 IP 协议号是？', ['1', '6', '89', '112'], '89',
    'OSPF 直接封装在 IP 中，协议号 89；IS-IS 用 CLNP，BGP 用 TCP 179，RIP 用 UDP 520。', 'datacom-ospf', 'IA', 'hot')
add('multiple', '下列关于 OSPF 区域的说法，正确的有？',
    ['所有非骨干区域必须与 Area 0 直连', 'Area 0 是骨干区域', '完全末梢区域 Totally Stub 不接收 Type-3/4/5 LSA', 'NSSA 区域可以引入外部路由且不产生 Type-5 LSA'],
    ['所有非骨干区域必须与 Area 0 直连', 'Area 0 是骨干区域', '完全末梢区域 Totally Stub 不接收 Type-3/4/5 LSA', 'NSSA 区域可以引入外部路由且不产生 Type-5 LSA'],
    'OSPF 区域化减少 LSA 泛洪；Stub/Totally Stub 阻断外部路由，NSSA 用 Type-7 承载外部路由再由 ABR 转为 Type-5。', 'datacom-ospf', 'IP')
add('single', 'OSPF 中，ABR（区域边界路由器）是指？', ['连接 OSPF 域与非 OSPF 域的路由器', '同时属于两个及以上区域且至少一个为 Area 0 的路由器', '负责引入外部路由的路由器', 'DR 选举失败的备份路由器'],
    '同时属于两个及以上区域且至少一个为 Area 0 的路由器', 'ABR 连接多个区域（含 Area 0），用于区域间路由汇聚与 LSA 汇总；ASBR 才负责引入外部路由。', 'datacom-ospf', 'IP')
add('single', 'OSPF 网络中，DR（指定路由器）的作用是？', ['减少广播型链路上邻接关系数量与 LSA 泛洪', '加快链路故障检测', '负责区域间路由计算', '分配 IP 地址'],
    '减少广播型链路上邻接关系数量与 LSA 泛洪', '广播/NBMA 网段选举 DR/BDR，其他路由器只与 DR/BDR 建立全邻接，降低邻接数与 LSA 泛洪。', 'datacom-ospf', 'IA', 'hot')
add('single', '在华为设备上查看 OSPF 邻居状态的命令是？', ['display ospf peer', 'display ospf interface', 'display ip routing-table', 'display ospf lsdb'],
    'display ospf peer', 'display ospf peer 查看邻居及状态（Full/2-Way 等）；interface 看接口成本，lsdb 看链路状态库。', 'datacom-ospf', 'IA', 'real')
add('single', 'OSPF 邻接关系建立到 Full 状态，表示？', ['邻居发现完成', '数据库同步完成，可计算路由', '仅完成 DR 选举', '链路连通但无路由'],
    '数据库同步完成，可计算路由', 'OSPF 状态机：Down→Init→2-Way→ExStart→Exchange→Loading→Full；Full 表示 LSDB 同步完成。', 'datacom-ospf', 'IP')
add('judge', 'OSPF 属于距离矢量路由协议，依靠跳数作为度量值。', False,
    'OSPF 是链路状态（LS）协议，度量值为接口 Cost（默认 100Mbps/Cost，与带宽成反比），并非距离矢量。', 'datacom-ospf', 'IA')
add('single', 'OSPF 引入外部路由时，缺省路由类型（E1/E2）中，E2 的特点是？',
    ['内部累加 Cost，沿途叠加', '不累加内部 Cost，仅取外部 Cost', '只能在 Stub 区域使用', '必须手工指定'],
    '不累加内部 Cost，仅取外部 Cost', 'E2 外部路由在 OSPF 域内传播时保持外部 Cost 不变（不叠加内部 Cost）；E1 则累加内部 Cost，更精确但计算更重。', 'datacom-ospf', 'IP')
add('single', 'OSPF 的 Router-ID 选举规则是？',
    ['取最大的 Loopback 接口 IP', '手工配置优先，否则取最大物理接口 IP，再否则取最大 Loopback IP', '取最小的接口 IP', '随机生成'],
    '手工配置优先，否则取最大物理接口 IP，再否则取最大 Loopback IP', 'Router-ID 是 32 位点分十进制；优先手工 router id，否则自动选举最大 Loopback，否则最大物理接口 IP。', 'datacom-ospf', 'IP', 'hot')
add('judge', 'OSPF 的 Stub 区域允许 Type-5 外部 LSA 进入。', False,
    'Stub 区域阻止 Type-5 外部 LSA，由 ABR 下发缺省路由；Totally Stub 进一步阻断 Type-3/4；NSSA 用 Type-7 承载外部路由。', 'datacom-ospf', 'IP')

# --- OSPFv3 / IPv6 路由 ---
add('single', 'OSPFv3 用于 IPv6，与 OSPFv2 相比，其主要区别不包括？',
    ['OSPFv3 用 Router-ID 仍是 32 位 IPv4 格式', 'OSPFv3 报文头部不再携带地址信息', 'OSPFv3 依赖 IPv6 的认证扩展头', 'OSPFv3 直接在链路而非子网上运行'],
    'OSPFv3 依赖 IPv6 的认证扩展头', 'OSPFv3 取消协议内认证（交由 IPSec AH/ESP），Router-ID 仍 32 位，在链路上运行，报文头不含地址。', 'datacom-ospfv3', 'IP')
add('single', 'IPv6 链路本地地址的前缀是？', ['FE80::/10', 'FC00::/7', '2001::/16', 'FF00::/8'], 'FE80::/10',
    '链路本地地址 FE80::/10，仅在本地链路有效，用于邻居发现与路由协议邻居建立；FC00::/7 为唯一本地地址 ULA。', 'datacom-ipv6-basic', 'IA', 'hot')
add('single', 'IPv6 无状态地址自动配置（SLAAC）依赖的协议是？', ['DHCPv6', 'NDP（邻居发现协议）', 'ARP', 'ICMPv4'], 'NDP（邻居发现协议）',
    'SLAAC 通过 RA（路由器通告）携带前缀，主机据此生成地址；NDP 取代 IPv4 的 ARP，提供地址解析与邻居发现。', 'datacom-ipv6-basic', 'IA', 'real')
add('judge', 'IPv6 仍使用 ARP 协议进行 IP 到 MAC 的地址解析。', False,
    'IPv6 用 NDP（邻居发现协议）的 NS/NA 报文取代 ARP；IPv4 才用 ARP。', 'datacom-ipv6-basic', 'IA')
add('single', 'IPv6 地址 2001:0DB8:0000:0000:0000:0000:0000:0001 压缩后正确的是？',
    ['2001:DB8::1', '2001:DB8:0:0:0:0:0:1 也可', '两者都正确', '2001:DB8:::1'], '两者都正确',
    '前导零可省略（0DB8→DB8），连续全零段用 :: 代替（只能用一次）；2001:DB8::1 与 2001:DB8:0:0:0:0:0:1 等价。', 'datacom-ipv6-basic', 'IA', 'hot')

# --- BGP / BGP4+ ---
add('single', 'BGP 建立邻居所使用的传输层协议与端口是？', ['TCP 179', 'UDP 179', 'TCP 520', 'UDP 89'], 'TCP 179',
    'BGP 基于 TCP 179 建立邻居，可靠传输且无需周期性刷新，靠 Keepalive/Update 维持与增量更新。', 'datacom-bgp', 'IP', 'hot')
add('single', 'BGP 中，IBGP 邻居之间的 TTL 缺省为？', ['1', '255', '64', '0'], '255',
    'IBGP 邻居（同 AS）缺省 TTL=255（华为默认），允许跨多跳；EBGP 缺省 TTL=1，通常直连，配多跳需 ebgp-max-hop。', 'datacom-bgp', 'IP')
add('single', 'BGP 选路规则中，优先级别最高的属性（华为缺省）是？', ['Local_Pref', 'AS_Path 长度', 'Origin', 'MED'], 'Local_Pref',
    'BGP 选路（华为/通用）大致顺序：Preferred-Value（本地）→ Local_Pref（IBGP 内最高）→ 本地始发→ AS_Path 最短→ Origin→ MED。', 'datacom-bgp', 'IE')
add('single', 'BGP 的 AS_Path 属性主要作用是？', ['防环与选路（路径越短越优）', '标识路由来源', '加密路由更新', '限制路由传播范围'],
    '防环与选路（路径越短越优）', 'AS_Path 记录经过的 AS 号序列，收到含本 AS 号的路由则丢弃（防环），同时 AS 数量越少路径越优。', 'datacom-bgp', 'IP', 'hot')
add('judge', 'BGP 的 Next_Hop 属性在 IBGP 邻居间传递时，缺省不会自动改为更新报文的源地址。', True,
    'IBGP 水平分割：收到路由反射给另一 IBGP 时 Next_Hop 保持不变，因此常需 next-hop-local，否则下一跳不可达。', 'datacom-bgp', 'IE')
add('single', 'BGP4+（用于 IPv6）相较于 BGP-4，主要扩展是？', ['新增 MP_REACH_NLRI/MP_UNREACH_NLRI 多协议属性携带 IPv6 前缀', '改用 UDP 传输', '取消 AS_Path', '仅支持 EBGP'],
    '新增 MP_REACH_NLRI/MP_UNREACH_NLRI 多协议属性携带 IPv6 前缀', 'BGP4+ 通过多协议扩展属性承载 IPv6 与其他地址族路由，TCP 179 不变。', 'datacom-bgp4plus', 'IP')
add('single', 'BGP 路由反射器（RR）的作用是？', ['打破 IBGP 全互联要求，由 RR 反射路由', '加快 BGP 收敛', '替代 AS_Path', '用于 EBGP 邻居'],
    '打破 IBGP 全互联要求，由 RR 反射路由', 'IBGP 水平分割要求全互联（N² 邻接），RR 将 Client 路由反射给其他 Client/非 Client，降低邻接复杂度。', 'datacom-bgp', 'IE')

# --- IS-IS ---
add('single', 'IS-IS 属于哪类路由协议？', ['距离矢量', '链路状态', '路径矢量', '混合'], '链路状态',
    'IS-IS 与 OSPF 同属链路状态，直接运行在数据链路层（CLNP/IIH），收敛快、扩展性好，常用于运营商骨干。', 'datacom-isis', 'IP')
add('judge', 'IS-IS 中 Level-1 路由器只与本区域（Level-1/2）路由器建立邻接并维护本区域链路状态。', True,
    'Level-1 类似 OSPF 非骨干区域内，Level-2 跨区域，Level-1/2 类似 ABR 连接两者并向 L1 下发缺省。', 'datacom-isis', 'IP')
add('single', 'IS-IS 的 NET（网络实体标题）中，最后 1 字节表示？', ['AFI', 'System ID', 'SEL（N-Selector，恒为 00）', 'Area ID'], 'SEL（N-Selector，恒为 00）',
    'NET 格式：AFI + Area ID + System ID(6B) + SEL(1B，通常为 00)；SEL=00 表示网络层本身，不指向上层协议。', 'datacom-isis', 'IE')

# --- 路由策略 / 策略路由 ---
add('single', '华为 route-policy 的匹配与执行顺序是？', ['按节点号从小到大，命中即执行对应动作并停止', '按节点号从大到小', '随机匹配', '只匹配最后一个节点'],
    '按节点号从小到大，命中即执行对应动作并停止', 'route-policy 节点编号升序匹配，命中某 node 的 if-match 后执行 apply 并结束（除非 continue）。', 'datacom-route-policy', 'IP', 'hot')
add('single', 'route-policy 中，若某节点配置了 if-match 但没有任何 apply，且该节点未命中，则？', ['允许通过', '拒绝通过', '进入下一节点继续匹配', '报错'],
    '进入下一节点继续匹配', '未命中当前节点 if-match 的路由继续向下匹配；尾节点默认拒绝（隐含 deny any）。', 'datacom-route-policy', 'IP')
add('judge', '策略路由（PBR）作用于路由表计算阶段，而路由策略（route-policy）作用于数据报文转发阶段。', False,
    '正相反：route-policy 过滤/修改"路由"，PBR 按策略控制"报文转发"；二者作用层次不同。', 'datacom-policy-route', 'IP', 'hot')
add('single', '华为实现 PBR 引流的三件套是？', ['traffic classifier / traffic behavior / traffic policy', 'acl / route-policy / filter-policy', 'policy-based-route 单命令', 'ip route-static + track'],
    'traffic classifier / traffic behavior / traffic policy', '流分类定义匹配条件，流行为定义重定向（redirect nexthop），流策略绑定后在接口应用（traffic-policy）。', 'datacom-policy-route', 'IP')

# --- VLAN / STP / MSTP ---
add('single', 'VLAN 标签（802.1Q）插入在以太网帧的什么位置？', ['目的 MAC 与源 MAC 之间', '源 MAC 与类型/长度之间', 'FCS 之后', '帧头之前'],
    '源 MAC 与类型/长度之间', '802.1Q 在源 MAC 之后、类型字段之前插入 4 字节 Tag（TPID+Priority+CFI+VLAN ID 12bit）。', 'datacom-vlan', 'IA', 'hot')
add('single', 'VLAN 的 12bit VLAN ID 可用的 VLAN 号范围是？', ['0-4095，可用 1-4094', '1-1024', '0-255', '1-1005'], '0-4095，可用 1-4094',
    'VLAN ID 12 位共 0-4095；0 和 4095 保留，可用 1-4094。', 'datacom-vlan', 'IA', 'hot')
add('single', '生成树协议中，处于阻塞（Blocking/Discarding）状态的端口？', ['不转发数据但接收 BPDU', '转发数据', '学习 MAC 地址', '发送 BPDU'],
    '不转发数据但接收 BPDU', '阻塞端口接收并处理 BPDU 以维护拓扑，但不转发用户数据、不学习 MAC（Discarding 状态）。', 'datacom-stp', 'IA', 'hot')
add('single', 'STP 的根桥选举依据是？', ['桥 ID（优先级+MAC）最小', '端口 ID 最小', 'IP 地址最小', '随机'],
    '桥 ID（优先级+MAC）最小', '桥 ID = 桥优先级（默认 32768）+ MAC；越小越优，优先选举为根桥。', 'datacom-stp', 'IA', 'real')
add('judge', 'RSTP 中，Alternate 端口是根端口的备份，Backup 端口是指定端口的备份。', True,
    'RSTP 引入角色：Alternate 备份到根路径（根端口备选），Backup 备份到网段（指定端口备选），加快收敛。', 'datacom-stp', 'IP')
add('single', 'MSTP 要将多个 VLAN 映射到同一生成树实例，应在哪个视图下配置？',
    ['stp region-configuration', 'vlan batch', 'interface', 'ospf'], 'stp region-configuration',
    'MSTP 域配置视图下用 instance <id> vlan <list> 映射 VLAN 到实例，三要素（域名/修订级/映射）一致才同域。', 'datacom-mstp', 'IP', 'real')
add('judge', 'Super-VLAN（VLAN 聚合）的 Sub-VLAN 之间二层互通，无需任何配置。', False,
    'Sub-VLAN 间二层隔离，需开启 VLAN 间 ARP 代理（arp-proxy intra-sub-vlan-proxy）才能经 Super-VLAN 三层互通。', 'datacom-vlan-aggregate', 'IP', 'hot')

# --- 可靠性 VRRP / BFD ---
add('single', 'VRRP 中，Master 路由器定期发送通告的报文是？', ['Advertisement 报文（组播 224.0.0.18）', 'Hello 报文', 'BPDU', 'ARP'],
    'Advertisement 报文（组播 224.0.0.18）', 'VRRP Master 周期性发 Advertisement（缺省 1s），组播地址 224.0.0.18，优先级 0 表示放弃 Master。', 'datacom-vrrp', 'IP', 'hot')
add('single', 'VRRP 默认优先级范围是？', ['0-255，缺省 100', '1-254', '0-100', '1-128'], '0-255，缺省 100',
    'VRRP 优先级 0-255，缺省 100；0 保留给 Master 主动退出；可配置 1-254，越大越优先。', 'datacom-vrrp', 'IP')
add('judge', 'BFD 不仅能检测链路故障，还能参与路由计算并选择最优路径。', False,
    'BFD 仅做快速故障检测（毫秒级），不参与选路；需与 OSPF/BGP/VRRP/静态路由联动加速收敛。', 'datacom-bfd', 'IP', 'hot')

# --- 子网划分（生成器批量，保证计算正确）---
import ipaddress

def _neighbors(net_cidr, host_cidr):
    net = ipaddress.ip_network(net_cidr, strict=False)
    sub = ipaddress.ip_network(host_cidr, strict=False)
    step = sub.num_addresses
    base = int(sub.network_address)
    return net, sub, step, base

def subnet_q(network, prefix, host_prefix, ask):
    net, sub, step, base = _neighbors(f"{network}/{prefix}", f"{network}/{host_prefix}")
    if ask == 'net':
        ans = str(sub.network_address)
        q = f"将 {network}/{prefix} 划分子网，子网掩码 /{host_prefix}，则首块子网 {sub.network_address}/{host_prefix} 的网络地址是？"
        opts = [ans, str(ipaddress.ip_address(base + step)), str(sub.broadcast_address), str(ipaddress.ip_address(base + 1))]
    elif ask == 'broadcast':
        ans = str(sub.broadcast_address)
        q = f"地址 {network}/{prefix} 采用 /{host_prefix} 子网划分，首块子网 {sub.network_address}/{host_prefix} 的广播地址是？"
        opts = [ans, str(sub.network_address), str(ipaddress.ip_address(base + step - 1)), str(ipaddress.ip_address(base + step))]
    elif ask == 'hosts':
        ans = str(sub.num_addresses - 2)
        total = sub.num_addresses
        q = f"{network}/{prefix} 按 /{host_prefix} 划分后，每个子网可用主机地址数量为？"
        opts = [ans, str(total), str(total - 1), str(total - 3)]
    else:
        ans = str(net.num_addresses // sub.num_addresses)
        cnt = net.num_addresses // sub.num_addresses
        q = f"{network}/{prefix} 可划分为多少个 /{host_prefix} 的子网？"
        opts = [ans, str(cnt + 1), str(cnt - 1), str(cnt * 2)]
    # 去重保序
    seen = set(); uniq = []
    for o in opts:
        if o not in seen:
            seen.add(o); uniq.append(o)
    # 把正确答案放回首位并打乱其余
    rest = [o for o in uniq if o != ans]
    import random
    random.seed(hash(q) & 0xffffffff)
    random.shuffle(rest)
    return q, [ans] + rest, ans

SUB_NETS = [
    ('192.168.10.0', 24, 26, 'net'), ('192.168.10.0', 24, 26, 'broadcast'),
    ('192.168.10.0', 24, 26, 'hosts'), ('192.168.10.0', 24, 26, 'subnets'),
    ('10.0.0.0', 16, 24, 'subnets'), ('10.0.0.0', 16, 24, 'hosts'),
    ('172.16.0.0', 20, 24, 'subnets'), ('172.16.0.0', 20, 24, 'hosts'),
    ('192.168.1.0', 24, 30, 'hosts'), ('192.168.1.0', 24, 30, 'subnets'),
    ('192.168.1.0', 24, 28, 'hosts'), ('192.168.1.0', 24, 28, 'subnets'),
    ('10.10.0.0', 22, 24, 'subnets'), ('10.10.0.0', 22, 24, 'hosts'),
    ('200.1.1.0', 24, 27, 'subnets'), ('200.1.1.0', 24, 27, 'hosts'),
    ('192.168.100.0', 24, 25, 'net'), ('192.168.100.0', 24, 25, 'broadcast'),
]
for (nw, p, hp, a) in SUB_NETS:
    q, opts, ans = subnet_q(nw, p, hp, a)
    add('single', q, opts, ans, f"子网 {nw}/{p} 按 /{hp} 划分：块大小=2^(32-{hp})，可用主机=块-2，子网数=原块/新块。", 'datacom-ip-subnet', 'IA', 'real')

# --- NAT ---
add('single', '华为设备上，将私网地址转换为公网地址出 Internet，应配置？', ['NAT Outbound（Easy-IP 或地址池）', 'NAT Server', '静态 NAT 一对一', 'NAT ALG'],
    'NAT Outbound（Easy-IP 或地址池）', '出方向多对一/地址池转换用 nat outbound；NAT Server 用于内网服务器对外发布；Easy-IP 用出接口地址做 PAT。', 'datacom-nat', 'IA', 'hot')
add('single', 'NAT Server 的主要作用是？', ['将内网服务器映射为固定公网地址/端口对外提供服务', '隐藏内网所有主机', '做负载均衡', '加速 DNS'],
    '将内网服务器映射为固定公网地址/端口对外提供服务', 'nat server 将内网服务器（如 Web）以公网 IP:端口发布，外部可访问；区别于出方向 nat outbound。', 'datacom-nat', 'IP')
add('judge', 'Easy-IP 方式的 NAT 直接使用路由器出接口的公网 IP 地址做地址转换，无需地址池。', True,
    'Easy-IP（出接口地址）适合拨号/动态公网 IP 场景，NAT 转换用出接口 IP，省去地址池配置。', 'datacom-nat', 'IA')

# --- DHCP ---
add('single', 'DHCP 客户端获取地址的四步交互（DORA）依次是？',
    ['Discover→Offer→Request→Ack', 'Request→Offer→Discover→Ack', 'Offer→Discover→Ack→Request', 'Discover→Request→Offer→Ack'],
    'Discover→Offer→Request→Ack', 'DHCP 四步：客户端广播 Discover，服务器 Offer，客户端 Request，服务器 Ack；均基于 UDP 67/68。', 'datacom-dhcp', 'IA', 'hot')
add('judge', 'DHCP Snooping 信任端口应当指向合法 DHCP 服务器方向，非信任端口收到的 Offer/Ack 会被丢弃。', True,
    'DHCP Snooping 区别信任/非信任端口，非信任端口的服务器响应被丢弃，防止私接 DHCP 服务器欺骗。', 'security-dhcp-snooping', 'IP', 'hot')

# --- ACL ---
add('single', '华为基本 ACL（2000-2999）只能匹配？', ['源 IP 地址', '源和目的 IP', 'TCP/UDP 端口号', '协议号'], '源 IP 地址',
    '基本 ACL 编号 2000-2999 仅匹配源 IP；高级 ACL 3000-3999 可匹配源/目的 IP、协议、端口等。', 'datacom-acl', 'IA', 'hot')
add('single', 'ACL 规则匹配顺序是？', ['按规则 ID 从小到大', '按配置先后', '随机', '按动作 deny 优先'], '按规则 ID 从小到大',
    '华为 ACL 缺省按规则 ID 升序匹配，命中即执行；ACL 本身不生效，须被 traffic-filter/route-policy 等调用。', 'datacom-acl', 'IA', 'real')

# --- 链路聚合 / 堆叠 ---
add('single', '华为链路聚合 LACP 模式下，主动端由什么决定？', ['系统优先级最小且 MAC 最小', '端口号最小', 'IP 地址', '随机'],
    '系统优先级最小且 MAC 最小', 'LACP 比较系统优先级（默认 32768），小者为主动端；相同则比系统 MAC，小者主动，负责选举活动链路。', 'datacom-link-aggregation', 'IP')
add('judge', 'Eth-Trunk 的 Trunk 类型成员口默认放行所有 VLAN。', False,
    '华为 Trunk 口默认只允许 VLAN 1，需手工 permit vlan；与 Cisco 默认放行所有不同，易踩坑。', 'datacom-link-aggregation', 'IP', 'hot')

# --- QoS ---
add('single', 'QoS 中，将报文按优先级放入不同队列并调度的模型是？', ['DiffServ（区分服务）', 'IntServ（综合服务）', 'Best-Effort', 'MPLS'], 'DiffServ（区分服务）',
    'DiffServ 按 DSCP/PHB 分类标记并在每跳调度（流速/整形/丢包），扩展性好；IntServ 用 RSVP 预留资源，开销大。', 'datacom-qos-basic', 'IP')
add('multiple', '华为 QoS 的流分类与动作通常包括？',
    ['分类（classifier）识别流量', '标记（重标记 DSCP/802.1p）', '监管（car 限速）', '队列调度（pq/wfq）'],
    ['分类（classifier）识别流量', '标记（重标记 DSCP/802.1p）', '监管（car 限速）', '队列调度（pq/wfq）'],
    'QoS 框架：流分类→标记→监管/整形→队列调度→拥塞避免（WRED），端到端保障关键业务。', 'datacom-qos-basic', 'IP')

# --- 网络管理 ---
add('single', 'SNMPv3 相比 v1/v2c 的核心改进是？', ['支持认证与加密（安全模型）', '使用明文团体字', '只能读不能写', '端口改为 TCP'],
    '支持认证与加密（安全模型）', 'SNMPv3 引入 USM 安全模型，支持 auth（认证）+priv（加密）；v1/v2c 仅靠明文 community，不安全。', 'datacom-nms', 'IP', 'hot')
add('single', 'NQA（网络质量分析）常被用来？', ['探测链路时延/丢包并与静态路由或 PBR 联动实现探测联动', '替代路由协议计算路由', '配置 VLAN', '生成加密密钥'],
    '探测链路时延/丢包并与静态路由或 PBR 联动实现探测联动', 'NQA 周期性探测（ICMP/TCP/HTTP），track 联动静态路由或 PBR，实现链路故障时的流量切换。', 'datacom-nms', 'IP')

# --- 应用层 / 端口 ---
add('single', 'DNS 协议使用的端口与传输层协议是？', ['53/UDP+TCP', '53/UDP 仅', '443/TCP', '67/UDP'], '53/UDP+TCP',
    'DNS 查询多用 UDP 53，区域传送与超大响应用 TCP 53。', 'datacom-application-layer', 'IA', 'hot')
add('single', '下列端口对应错误的是？', ['HTTPS=443/TCP', 'SSH=22/TCP', 'Telnet=23/TCP', 'SNMP=161/TCP'], 'SNMP=161/TCP',
    'SNMP Agent 用 UDP 161（Trap 用 UDP 162），不是 TCP。', 'datacom-application-layer', 'IA', 'real')
add('judge', 'IP 协议号 89 用于 OSPF，协议号 6 用于 TCP，协议号 17 用于 UDP。', True,
    '常见协议号：ICMP=1、TCP=6、UDP=17、OSPF=89、GRE=47、ESP=50、AH=51。', 'datacom-application-layer', 'IA', 'hot')

# ----------------------------------------------------------------------
# 安全方向（国赛 25%）
# ----------------------------------------------------------------------

# --- 防火墙基础 ---
add('single', '华为防火墙缺省预定义了哪几个安全区域？', ['Trust、DMZ、Untrust、Local', 'Inside、Outside、DMZ', 'LAN、WAN、DMZ', 'Trust、Untrust'],
    'Trust、DMZ、Untrust、Local', '华为防火墙默认区域：Local（设备自身）、Trust（内网）、DMZ（隔离区）、Untrust（外网）；Local 优先级 100，Trust 85，DMZ 50，Untrust 5。', 'security-firewall-basic', 'IA', 'hot')
add('judge', '华为防火墙同一安全区域内（如都属于 Trust）的报文，缺省策略是放行的。', True,
    '防火墙缺省对"同区域"报文放行，跨区域需安全策略；缺省跨区域为拒绝（default deny）。', 'security-firewall-basic', 'IA')
add('single', '状态检测防火墙（ASPF）相比包过滤防火墙的核心优势是？', ['基于会话状态与上下文进行深度检测，识别多通道协议', '仅检查源/目的 IP', '速度更快', '不需要维护会话表'],
    '基于会话状态与上下文进行深度检测，识别多通道协议', '包过滤只检查五元组首包；ASPF 维护会话表、跟踪连接状态并动态放行返回报文，支持 FTP 等多通道协议。', 'security-firewall-basic', 'IP')
add('single', '华为防火墙的安全策略匹配顺序是？', ['按规则 ID/优先级从上到下，命中即执行', '随机', '按动作 deny 优先', '按创建时间'],
    '按规则 ID/优先级从上到下，命中即执行', '安全策略列表自上而下匹配，命中即执行（允许/拒绝），后续规则不再匹配；需把精确规则放前面。', 'security-firewall-basic', 'IP', 'hot')
add('single', '防火墙缺省对未匹配任何安全策略的跨域报文处理是？', ['拒绝（default deny）', '允许', '记录日志后放行', '重定向'],
    '拒绝（default deny）', '防火墙遵循"缺省拒绝"原则，未命中允许策略的跨域报文被丢弃，符合最小权限安全模型。', 'security-firewall-basic', 'IA')
add('single', '华为防火墙缺省管理接口 G0/0/0 的 IP 地址通常是？', ['192.168.0.1/24', '10.0.0.1/24', '172.16.0.1/24', '192.168.1.1/24'],
    '192.168.0.1/24', '华为防火墙出厂 G0/0/0 管理口默认 IP 192.168.0.1/24，用于首次 Web/SSH 登录管理。', 'security-firewall-basic', 'IA', 'real')

# --- IPSec VPN ---
add('single', 'IPSec 用于加密保护 IP 层通信，其中只提供认证与完整性、不加密载荷的协议是？', ['AH（51）', 'ESP（50）', 'IKE', 'GRE'],
    'AH（51）', 'AH（协议号 51）提供数据源认证、完整性、抗重放但不加密；ESP（50）才提供加密+认证。', 'security-ipsec', 'IP', 'hot')
add('single', 'IKE 协商中，IKE SA（阶段 1）的作用是？', ['建立安全通道以保护 IPSec SA 的协商', '直接加密业务数据', '分发用户证书', '分配 IP 地址'],
    '建立安全通道以保护 IPSec SA 的协商', '阶段 1 建立 IKE SA（双向安全关联）保护阶段 2；阶段 2 在其保护下协商 IPSec SA 用于数据加密。', 'security-ipsec', 'IP')
add('judge', 'IPSec 隧道模式会在原始 IP 报文外再封装一个新的 IP 头，而传输模式不新增 IP 头。', True,
    '传输模式仅加密/认证 IP 载荷（含原 IP 头），隧道模式新增外层 IP 头以实现网关到网关或远程接入。', 'security-ipsec', 'IP', 'hot')
add('single', 'IKEv1 阶段 1 的"主模式（Main Mode）"共交换几条消息？', ['6 条', '3 条', '2 条', '9 条'],
    '6 条', '主模式 6 条消息（3 次交互）完成身份保护下的 SA 协商；野蛮模式（Aggressive）仅 3 条，身份明文暴露。', 'security-ipsec', 'IE')
add('single', 'IPSec 的 ESP 协议号是？', ['50', '51', '47', '89'], '50',
    'ESP 协议号 50，AH 协议号 51；GRE 47，OSPF 89。', 'security-ipsec', 'IP', 'real')

# --- SSL VPN ---
add('single', 'SSL VPN 相较于 IPSec VPN 的突出优点是？', ['基于 HTTPS（TCP 443），无需安装专用客户端', '加密强度更高', '必须专线', '只能用于站点到站点'],
    '基于 HTTPS（TCP 443），无需安装专用客户端', 'SSL VPN 经浏览器/轻量客户端经 443 端口，穿透 NAT/防火墙容易，适合远程接入；IPSec 多为站点到站点。', 'security-ssl-vpn', 'IP', 'hot')
add('judge', 'SSL VPN 只能提供 Web 代理一种资源访问方式。', False,
    'SSL VPN 资源类型含 Web 代理、文件共享、端口转发（TCP 应用）、网络扩展（完整隧道）等多种。', 'security-ssl-vpn', 'IP')

# --- 认证与准入 ---
add('single', '802.1X 认证的三元组（架构角色）不包括？', ['认证客户端（Supplicant）', '认证者（Authenticator，如交换机）', '认证服务器（如 RADIUS）', '防火墙'],
    '防火墙', '802.1X 三元组：客户端、认证者（接入设备）、认证服务器（RADIUS/AAA）；防火墙不是 802.1X 角色。', 'security-8021x', 'IP', 'hot')
add('single', 'RADIUS 协议使用的传输层协议与端口是？', ['UDP 1812/1813（认证/计费）', 'TCP 1812', 'UDP 1645/1646', 'TCP 53'],
    'UDP 1812/1813（认证/计费）', 'RADIUS 基于 UDP，认证 1812、计费 1813（旧 1645/1646）；与 TACACS+（TCP 49）不同。', 'security-auth', 'IP', 'real')
add('single', '802.1X 端口的"强制授权（authorized）"状态表示？', ['端口无条件放行，无需认证', '端口拒绝所有', '仅放行访客 VLAN', '端口关闭'],
    '端口无条件放行，无需认证', '端口授权状态：auto（按认证结果）、force-authorized（强制放行）、force-unauthorized（强制拒绝）。', 'security-8021x', 'IP')
add('judge', 'MAC 地址认证无需客户端软件，设备根据终端 MAC 地址到 RADIUS 认证。', True,
    'MAC 认证（MAC bypass）适合打印机等哑终端，用 MAC 作账号认证；相比 802.1X 无需客户端。', 'security-auth', 'IP')
add('multiple', '园区网络常见的三种终端准入控制技术包括？', ['802.1X 认证', 'MAC 地址认证', 'Portal（Web）认证', 'IPSec 隧道'],
    ['802.1X 认证', 'MAC 地址认证', 'Portal（Web）认证'], '三种主流准入：802.1X（需客户端/支持 EAP）、MAC 认证（哑终端）、Portal（Web 免客户端）；IPSec 是 VPN 非准入。', 'security-auth', 'IP', 'hot')

# --- 密码学与 PKI ---
add('single', '下列哪种属于对称加密算法？', ['AES', 'RSA', 'ECC', 'DH'], 'AES',
    'AES/DES/3DES/SM4 为对称加密（同钥匙加解密，速度快）；RSA/ECC/SM2 为非对称；DH 为密钥交换。', 'security-crypto', 'IA', 'hot')
add('single', '数字签名使用的密钥组合是？', ['发送方私钥签名，接收方公钥验签', '发送方公钥签名', '对称密钥签名', 'CA 私钥加密'],
    '发送方私钥签名，接收方公钥验签', '非对称用法：私钥签名（不可否认+完整性），公钥验签；公钥加密则是对方私钥解密（保密）。', 'security-pki', 'IP', 'hot')
add('single', '下列算法中，属于国产密码（国密）的是？', ['SM2/SM3/SM4', 'RSA/SHA', 'AES/DES', 'MD5'], 'SM2/SM3/SM4',
    '国密：SM1（对称）、SM2（非对称，类 ECC）、SM3（哈希）、SM4（对称分组）；SM2 对标 RSA/ECC，SM3 对标 SHA，SM4 对标 AES。', 'security-crypto', 'IP')
add('single', '哈希（摘要）算法的特征是？', ['不可逆，用于完整性校验', '可解密还原原文', '用于密钥交换', '对称加密'],
    '不可逆，用于完整性校验', 'MD5/SHA/SM3 是单向哈希，由原文得固定长度摘要，不可逆；用于完整性校验与数字签名摘要。', 'security-crypto', 'IA')

# --- IDS / IPS / UTM ---
add('single', '下列区别中，IDS 与 IPS 的关键不同是？', ['IPS 串联部署可实时阻断，IDS 旁路仅检测告警', 'IDS 比 IPS 更快', 'IPS 不能检测', '两者完全相同'],
    'IPS 串联部署可实时阻断，IDS 旁路仅检测告警', 'IDS 旁路监听告警，IPS 串联在线可阻断攻击；IPS 对性能与误报更敏感。', 'security-ips-ids', 'IP', 'hot')
add('judge', 'IDS/IPS 的"误用检测（特征检测）"依赖已知攻击特征库，对未知攻击检出率低。', True,
    '误用检测基于特征库，检出已知攻击但对 0day/未知攻击弱；异常检测基于行为基线，可发现未知但误报高。', 'security-ips-ids', 'IP')
add('single', 'UTM（统一威胁管理）与 NGFW（下一代防火墙）的主要增强点是？', ['应用识别、用户身份关联与内容级深度检测', '仅包过滤', '只能做 NAT', '不防病毒'],
    '应用识别、用户身份关联与内容级深度检测', 'NGFW 在 UTM 基础上强化应用识别（App ID）、用户感知（User ID）与内容安全，实现基于应用的策略。', 'security-utm', 'IP')

# --- 攻击防护 ---
add('single', 'SYN Flood 攻击的典型防护手段是？', ['SYN Cookie / 代理半连接', '关闭防火墙', '加大 MTU', '禁用 TCP'],
    'SYN Cookie / 代理半连接', 'SYN Flood 伪造大量半连接耗尽资源；SYN Cookie 不在服务器保存半连接状态，避免资源耗尽。', 'security-attack-defense', 'IP', 'hot')
add('multiple', '下列属于 DDoS 攻击分类的有？', ['流量型（如 UDP/ICMP Flood）', '协议型（如 SYN Flood）', '应用型（如 HTTP Flood）', 'ARP 欺骗'],
    ['流量型（如 UDP/ICMP Flood）', '协议型（如 SYN Flood）', '应用型（如 HTTP Flood）'], 'DDoS 分流量型（耗尽带宽）、协议型（耗尽连接/会话）、应用型（耗尽应用资源）；ARP 欺骗属局域网攻击，非 DDoS。', 'security-attack-defense', 'IP')
add('single', '防止 MAC 地址泛洪攻击（CAM 表耗尽）的有效手段是？', ['端口安全限制 MAC 学习数量', '关闭交换机', '禁用 STP', '增大 MTU'],
    '端口安全限制 MAC 学习数量', '攻击者发送海量伪造源 MAC 填满 MAC 表导致泛洪；端口安全可限制每端口 MAC 数并违规处理。', 'security-port-security', 'IP', 'hot')
add('judge', '端口安全三种违规动作中，error-down 会直接关闭端口，protect 仅静默丢弃并上报。', True,
    'protect：静默丢弃违规帧；restrict：丢弃并告警（记录日志/计数）；error-down：关闭端口（需手动/自动恢复）。', 'security-port-security', 'IP')

# --- Portal 认证（免客户端 Web 准入）---
add('single', 'Portal 认证（Web 认证）相比 802.1X 最显著的优点是？', ['终端无需安装客户端', '加密强度最高', '必须结合 EAP', '仅支持有线'],
    '终端无需安装客户端', 'Portal 认证由浏览器完成，哑终端/访客机免装客户端；802.1X 通常需客户端或系统内置 EAP 支持。', 'security-portal', 'IP', 'hot')
add('multiple', '华为 Portal 认证体系通常包含以下哪些组件？', ['接入设备（交换机/防火墙）', 'Portal 服务器', 'RADIUS/AAA 服务器', 'DHCP 服务器'],
    ['接入设备（交换机/防火墙）', 'Portal 服务器', 'RADIUS/AAA 服务器'], 'Portal 认证三件套：接入设备重定向、Portal 服务器推送 Web 页面、RADIUS/AAA 完成账号校验与授权；DHCP 非必需组件。', 'security-portal', 'IP')
add('judge', 'Portal 认证中，用户未认证时访问任意 HTTP 站点都会被接入设备重定向到认证页面。', True,
    '未认证用户终端的 HTTP 请求被接入设备拦截并重定向到 Portal 认证页；认证通过后才放行正常业务流量。', 'security-portal', 'IA', 'hot')

# --- DHCP Snooping / IPSG / DAI ---
add('single', 'IP Source Guard（IPSG）依赖什么表项来校验 IP+MAC 合法性？', ['DHCP Snooping 绑定表', 'ARP 表', '路由表', 'MAC 地址表'],
    'DHCP Snooping 绑定表', 'IPSG 基于 DHCP Snooping 建立的绑定表（MAC-IP-端口-VLAN）校验报文源，非法则丢弃，防 IP/MAC 欺骗。', 'security-dhcp-snooping', 'IP', 'hot')
add('judge', '动态 ARP 检测（DAI）基于 DHCP Snooping 绑定表校验 ARP 报文，可防范 ARP 欺骗。', True,
    'DAI 在 VLAN 内检查 ARP 请求/应答的 IP-MAC 绑定是否与 Snooping 表一致，阻断伪造 ARP，防中间人。', 'security-dhcp-snooping', 'IP', 'hot')
add('single', '部署 DHCP Snooping 时，连接合法 DHCP 服务器的端口应当配置为？', ['信任端口（trusted）', '非信任端口', '关闭端口', '镜像端口'],
    '信任端口（trusted）', '信任端口放行的 DHCP Offer/Ack 来自合法服务器；非信任端口的服务器响应被丢弃，防私接 DHCP。', 'security-dhcp-snooping', 'IP', 'real')

# --- 防火墙高级 ---
add('single', '华为防火墙虚拟系统（Vsys）的主要作用是？', ['一台物理防火墙虚拟为多台逻辑防火墙，资源与配置隔离', '替代路由表', '做负载均衡', '加密磁盘'],
    '一台物理防火墙虚拟为多台逻辑防火墙，资源与配置隔离', 'Vsys 将单台设备虚拟为多个逻辑防火墙，由根系统分配会话/策略/带宽资源，互不影响，节约成本。', 'security-fw-advance', 'IP', 'hot')
add('judge', '防火墙智能选路根据链路质量（时延/丢包/带宽）自动选择最优出口，可实现多链路负载分担。', True,
    '智能选路结合 NQA 探测链路质量，按策略选择最优出口并做负载分担/备份，提升多出口可靠性与体验。', 'security-fw-advance', 'IP')
add('single', '华为防火墙双机热备中，VGMP 的作用是？', ['统一管理 VRRP 组状态，避免主备不一致', '加密会话表', '分配 IP', '限速'],
    '统一管理 VRRP 组状态，避免主备不一致', 'VGMP 将相关 VRRP 组绑定统一切换；HRP 负责会话表/配置同步；二者配合实现无缝主备切换。', 'security-ha', 'IE')

# --- 等保 / 运维 ---
add('judge', '等保 2.0 的技术框架可概括为"一个中心、三重防护"。', True,
    '一个中心（安全管理中心）+ 三重防护（安全通信网络、安全区域边界、安全计算环境）；是等保 2.0 核心框架。', 'security-management', 'IP', 'hot')
add('single', 'RPO（恢复点目标）描述的是？', ['灾难发生后允许丢失的数据量（时间）', '系统恢复所需最长时间', '业务中断成本', '备份频率'],
    '灾难发生后允许丢失的数据量（时间）', 'RTO 是恢复时间目标（多久恢复），RPO 是恢复点目标（最多丢多少数据）；两者越小要求越高。', 'security-management', 'IP')

# ----------------------------------------------------------------------
# WLAN 方向（国赛 25%）
# ----------------------------------------------------------------------

# --- 标准与频段 ---
add('single', 'Wi-Fi 6 对应的 IEEE 标准是？', ['802.11ax', '802.11ac', '802.11n', '802.11g'], '802.11ax',
    '802.11ax=Wi-Fi 6；ac=Wi-Fi 5；n=Wi-Fi 4；g/b/a 为早期标准。Wi-Fi 6 同时支持 2.4G 与 5G。', 'wlan-standard', 'IP', 'hot')
add('single', '中国 2.4GHz 频段可用的互不重叠信道是？', ['1、6、11', '1、2、3', '2、6、10', '1、5、9、13'], '1、6、11',
    '2.4G 每信道带宽 22MHz（802.11），互不重叠只有 1/6/11 三组；合理规划可降同频干扰。', 'wlan-rf', 'IA', 'hot')
add('judge', '5GHz 频段的穿透与绕射能力强于 2.4GHz，覆盖范围更大。', False,
    '正相反：5G 频率高、波长短，穿透与绕射弱于 2.4G，覆盖范围较小但速率高、干扰少。', 'wlan-rf', 'IA', 'hot')
add('single', 'Wi-Fi 6 的 OFDMA 技术主要解决？', ['多用户小包并发效率，降低时延', '提高单用户峰值速率', '扩大覆盖范围', '增强加密'],
    '多用户小包并发效率，降低时延', 'OFDMA 把信道划分为 RU 资源单元，多用户并行传输；与 MU-MIMO（空间流并行）互补。', 'wlan-wifi6', 'IP', 'hot')
add('single', 'Wi-Fi 6 相比 Wi-Fi 5，调制方式从 256-QAM 提升到？', ['1024-QAM', '64-QAM', '512-QAM', '4096-QAM'], '1024-QAM',
    'Wi-Fi 6 用 1024-QAM，比 Wi-Fi 5 的 256-QAM 提升约 25% 速率；更高阶调制提升频谱效率。', 'wlan-wifi6', 'IP')
add('judge', 'Wi-Fi 6 的 TWT（目标唤醒时间）可让终端按需唤醒，显著降低终端功耗。', True,
    'TWT 由 AP 与终端协商唤醒时间表，减少空闲监听，延长电池续航，利于 IoT 海量终端。', 'wlan-wifi6', 'IP')

# --- 架构 / CAPWAP / 上线 ---
add('single', 'FIT AP 与 AC 之间建立 CAPWAP 隧道，控制报文使用的 UDP 端口是？', ['5246', '5247', '1812', '443'], '5246',
    'CAPWAP 控制隧道 UDP 5246，数据隧道 UDP 5247；二者分离，控制负责管理、数据负责用户流量。', 'wlan-sta-online', 'IP', 'hot')
add('single', 'FIT AP 发现 AC 的方式不包括？', ['静态路由指向 AC', '二层广播发现', '三层单播发现', 'DHCP Option 43 / DNS 域名'],
    '静态路由指向 AC', 'AP 发现 AC：二层广播、三层单播、DHCP Option 43、DNS 域名；静态路由不是发现机制。', 'wlan-sta-online', 'IP', 'real')
add('judge', 'FAT AP 可独立工作、自带配置与转发，无需 AC 管理；FIT AP 需受 AC 集中管理。', True,
    'FAT（自治型）AP 独立运行；FIT（瘦）AP 由 AC 统一下发配置与转发决策，便于大规模运维。', 'wlan-arch', 'IA', 'hot')
add('single', 'STA（终端）接入 WLAN 的典型流程顺序是？', ['扫描→认证→关联→DHCP 获取 IP→上网', '关联→扫描→认证→DHCP', '认证→DHCP→扫描→关联', 'DHCP→扫描→关联→认证'],
    '扫描→认证→关联→DHCP 获取 IP→上网', '终端先扫描（主动/被动）发现 SSID，再认证与关联建立链路，最后 DHCP 获取 IP 接入网络。', 'wlan-sta-online', 'IA', 'hot')
add('single', 'WLAN 中 VAP（虚拟 AP）的作用是？', ['将一个物理 AP 虚拟为多个逻辑 AP，承载不同 SSID/业务', '加密无线信号', '做路由', '分配 IP'],
    '将一个物理 AP 虚拟为多个逻辑 AP，承载不同 SSID/业务', 'VAP 在射频上绑定 SSID、安全策略与业务 VLAN，实现多 SSID 隔离（如员工/访客）。', 'wlan-vap', 'IP')

# --- 射频与规划 ---
add('single', '频谱导航（Band Steer）的主要用途是？', ['引导双频终端优先接入 5GHz，缓解 2.4G 拥塞', '把终端踢下线', '加密 5G 频段', '提升发射功率'],
    '引导双频终端优先接入 5GHz，缓解 2.4G 拥塞', '5G 干扰少、速率高；频谱导航鼓励双频终端连 5G，平衡双频负载，改善体验。', 'wlan-planning', 'IP', 'hot')
add('judge', 'WLAN 规划中，AP 发射功率越大越好，可消除所有覆盖盲区。', False,
    '功率过大加剧同频干扰并导致漫游粘滞；过小则盲区；需折中并配合信道规划与蜂窝设计。', 'wlan-planning', 'IP', 'hot')
add('single', '高密场景（会议室/场馆）WLAN 部署的关键优化手段是？', ['降低功率、缩小蜂窝、启用负载均衡', '提高功率、扩大蜂窝', '关闭 5G 只用 2.4G', '禁用负载均衡'],
    '降低功率、缩小蜂窝、启用负载均衡', '高密场景需小蜂窝复用信道、降功率减干扰、负载均衡分流用户，避免单 AP 过载。', 'wlan-planning', 'IP')

# --- 安全 ---
add('single', 'WPA2 个人版（WPA2-PSK）使用的加密算法是？', ['CCMP（AES）', 'TKIP', 'WEP', 'DES'], 'CCMP（AES）',
    'WPA2 用 CCMP（基于 AES）加密；WPA（过渡）用 TKIP；WEP 已被攻破不安全。', 'wlan-security', 'IP', 'hot')
add('single', 'WLAN 企业级（802.1X）认证中，终端与认证服务器之间真正的认证协议通常是？', ['EAP（如 PEAP/EAP-TLS）', 'WEP', 'WPA-PSK', 'TKIP'],
    'EAP（如 PEAP/EAP-TLS）', '802.1X 用 EAP 承载认证（PEAP 隧道内 MSCHAPv2，EAP-TLS 证书），终端经 AP/AC 与 RADIUS 完成认证。', 'wlan-security', 'IP', 'hot')
add('judge', 'WPA3 引入 SAE（dragonfly 握手）以替代 WPA2-PSK，提升离线字典攻击防护。', True,
    'WPA3-Personal 用 SAE（Simultaneous Authentication of Equals）抵抗离线暴力破解，并支持前向保密。', 'wlan-security', 'IE')
add('single', 'WLAN 中防范"钓鱼 AP/非法 AP"的常用手段是？', ['WIDS/WIPS 非法设备检测与反制', '提高 SSID 隐藏', '关闭加密', '增大功率'],
    'WIDS/WIPS 非法设备检测与反制', 'WIDS 检测 rogue AP/干扰，WIPS 可反制（阻断/定位）；隐藏 SSID 不能真正防钓鱼。', 'wlan-security', 'IP')

# --- 漫游 ---
add('single', 'STA 在同一 AC 内、同子网内从 AP1 切换到 AP2，属于？', ['二层漫游', '三层漫游', '跨 AC 漫游', '无缝切换'], '二层漫游',
    '二层漫游：STA 在同一子网（同一 VLAN/AC）内切换，IP 不变；三层漫游跨子网需隧道保持 IP。', 'wlan-roaming', 'IP', 'hot')
add('judge', '跨 AC 的三层漫游需要保证 STA 的业务 IP 在切换后仍可达，通常借助 AC 间隧道。', True,
    '跨 AC/跨子网漫游时，原 AC 经隧道保持 STA 的 IP 与业务连续性，避免重新获取地址导致断流。', 'wlan-roaming', 'IP')

# ----------------------------------------------------------------------
# DCN 方向（省赛 20%，国赛 0% 但省复赛必考）
# ----------------------------------------------------------------------

# --- 架构 ---
add('single', '现代数据中心主流组网架构是？', ['Spine-Leaf（胖树/Clos）', '传统三层（核心-汇聚-接入）', '总线型', '环形'], 'Spine-Leaf（胖树/Clos）',
    '数据中心东西向流量大，Spine-Leaf 任意 Leaf 间经一跳 Spine，延迟可预测、易扩展，取代传统三层。', 'dcn-clos', 'IP', 'hot')
add('judge', 'Spine-Leaf 架构中，Leaf 之间可以直接转发流量，无需经过 Spine。', False,
    'Spine-Leaf 下 Leaf 之间不直接相连，所有跨 Leaf 流量须经 Spine（一跳）；Leaf 只接服务器/边界。', 'dcn-clos', 'IP', 'hot')
add('single', '数据中心"Underlay"与"Overlay"分别指？', ['Underlay 为物理 IP 承载网，Overlay 为 VXLAN 等虚拟网络', 'Underlay 为虚拟网，Overlay 为物理网', '同义词', '都指路由协议'],
    'Underlay 为物理 IP 承载网，Overlay 为 VXLAN 等虚拟网络', 'Underlay 提供设备间 IP 互通与路由；Overlay（VXLAN/EVPN）在之上提供租户二层/三层虚拟网络。', 'dcn-arch', 'IP', 'hot')

# --- VXLAN ---
add('single', 'VXLAN 用于大二层扩展，其 VNI（租户标识）长度为？', ['24 bit（约 1600 万）', '12 bit（4094）', '16 bit', '32 bit'], '24 bit（约 1600 万）',
    'VXLAN 用 24bit VNI，提供约 1600 万租户，突破 VLAN 12bit（4094）限制；报文封装在 UDP 4789。', 'dcn-vxlan-basic', 'IP', 'hot')
add('single', 'VXLAN 报文外层封装使用的 UDP 目的端口是？', ['4789', '5246', '1812', '443'], '4789',
    'VXLAN 将原始以太帧封装在 UDP（目的端口 4789）中经 IP 传输，实现跨三层的大二层。', 'dcn-vxlan-basic', 'IP', 'hot')
add('judge', 'VXLAN 本质是在 IP 网络之上构建的"大二层"Overlay，使虚拟机跨子网迁移时 IP/MAC 不变。', True,
    'VXLAN 把二层帧封装进 IP，使租户二层域跨越三层 Underlay，支持 VM 大范围迁移且地址不变。', 'dcn-vxlan', 'IP', 'hot')
add('single', 'VXLAN 集中式网关与分布式网关相比，集中式网关的主要缺点是？', ['存在东西向流量绕行与性能瓶颈', '不支持三层转发', '无法隔离租户', '必须每台 Leaf 配置'],
    '存在东西向流量绕行与性能瓶颈', '集中式网关在 Spine/专用设备，东西向流量需绕行网关易成瓶颈；分布式网关下沉 Leaf 就近转发。', 'dcn-vxlan-gateway', 'IE')

# --- EVPN ---
add('single', '在华为数据中心方案中，VXLAN 常用的控制平面协议是？', ['BGP EVPN', 'OSPF', 'RIP', 'STP'], 'BGP EVPN',
    'BGP EVPN 作为 VXLAN 控制平面，以 Type-2 分发 MAC/IP、Type-3 转发隧道、Type-5 外部路由，取代泛洪学习。', 'dcn-evpn', 'IE', 'hot')
add('judge', 'BGP EVPN Type-2 路由用于在 VTEP 间通告主机的 MAC 地址与 IP 地址（ARP/ND 信息）。', True,
    'EVPN Type-2（MAC/IP 通告）携带主机 MAC/IP，实现控制平面学习、抑制 ARP 泛洪，替代数据平面泛洪。', 'dcn-evpn', 'IE')

# --- SDN ---
add('single', 'SDN（软件定义网络）的核心思想是？', ['控制平面与转发平面分离，集中控制', '取消路由协议', '只用硬件转发', '增大 MAC 表'],
    '控制平面与转发平面分离，集中控制', 'SDN 将控制逻辑集中到控制器，转发设备只按流表执行，开放可编程，提升自动化与灵活性。', 'dcn-sdn-basic', 'IP', 'hot')
add('single', 'SDN 的南向接口（控制器—转发设备）常见协议是？', ['OpenFlow / NETCONF', 'HTTP', 'BGP', 'ARP'], 'OpenFlow / NETCONF',
    '南向接口：OpenFlow（流表下发）、NETCONF（配置）、OVSDB 等；北向接口（控制器—应用）多为 REST API。', 'dcn-sdn-controller', 'IP', 'hot')
add('judge', '华为 SDN 控制器（如 iMaster NCE）通过南向接口实现网络自动化部署、策略下发与可视化运维。', True,
    'iMaster NCE 作为 SDN 控制器集中管理 Underlay/Overlay，自动化发放配置、监控与故障定位，是华为数据中心/园区 SDN 核心。', 'dcn-sdn-controller', 'IP')

# ----------------------------------------------------------------------
# 国赛权重再平衡补充（WLAN 25% / 安全 25% 重点加深，IP/IE 为主）
# ----------------------------------------------------------------------

# --- WLAN 进阶 ---
add('single', 'WLAN 中用于区分业务优先级的 WMM（Wi-Fi 多媒体）基于 802.11e 的 EDCA，其四类接入类别（AC）不包括？', ['AC_SP（专用信令）', 'AC_VO（语音）', 'AC_VI（视频）', 'AC_BE（尽力）'], 'AC_SP（专用信令）',
    'WMM/EDCA 四类：AC_VO(语音)、AC_VI(视频)、AC_BE(尽力)、AC_BK(背景)；按竞争窗口与 AIFSN 区分优先级。', 'wlan-qos', 'IP', 'hot')
add('single', '802.11r（快速 BSS 过渡）主要优化？', ['重新关联时的密钥协商，加快漫游', '提高速率', '扩大覆盖', '加密强度'],
    '重新关联时的密钥协商，加快漫游', '802.11r 通过 FT（Fast Transition）在漫游时复用 PMK，免除完整 802.1X/四次握手，降低漫游时延。', 'wlan-roaming', 'IP', 'hot')
add('judge', 'CAPWAP 断链后，采用"本地转发（直接转发）"模式的 AP 仍可继续为用户转发数据，业务不中断。', True,
    '本地转发（直转）下用户数据不经 AC，CAPWAP 断链不影响已在线业务；集中转发则业务中断需 AP 掉线重连。', 'wlan-arch', 'IE')
add('single', '5GHz 中部分信道受 DFS（动态频率选择）约束，当检测到雷达信号时必须？', ['切换到其他信道', '提高功率', '关闭射频', '忽略雷达'],
    '切换到其他信道', 'DFS 信道（如 52-144）需避让雷达（气象/军用），检测到雷达后 AP 须在一分钟内切换信道，避免干扰。', 'wlan-rf', 'IP', 'hot')
add('single', '无线信号强度 dBm 与 dB 的关系中，0 dBm 表示？', ['1 毫瓦参考功率', '0 瓦', '最大功率', '无单位比值'], '1 毫瓦参考功率',
    'dBm 以 1mW 为参考的对数单位；0 dBm=1mW，10 dBm=10mW，-70 dBm 为常见可用信号下限。', 'wlan-rf', 'IA', 'hot')
add('judge', '隐藏 SSID（关闭广播 Beacon 中的 SSID）可以有效防止非法接入与钓鱼攻击。', False,
    '隐藏 SSID 仅是隐蔽性，终端探测/嗅探仍可发现，且增加接入复杂度；真正防护靠 802.1X/WPA3 与 WIDS。', 'wlan-security', 'IP')
add('single', 'WLAN 中用于引导终端快速发现可用 AP 与优化漫游的标准是？', ['802.11k（邻居报告）/802.11v（BSS 过渡管理）', '802.11ac', '802.11r', '802.11i'],
    '802.11k（邻居报告）/802.11v（BSS 过渡管理）', '802.11k 提供邻居 AP 列表，802.11v 协助终端决策漫游，配合 802.11r 实现快速、智能漫游。', 'wlan-roaming', 'IP')
add('single', '华为 WLAN 的"智能漫游"功能主要用于解决？', ['终端"漫游粘滞"——赖在弱信号 AP 不切换', '提高 AP 发射功率', '加密数据', '分配 IP'],
    '终端"漫游粘滞"——赖在弱信号 AP 不切换', '智能漫游（如 802.11v 引导+阈值触发）主动促使终端从弱信号 AP 切换到更强 AP，改善体验。', 'wlan-planning', 'IP', 'hot')
add('single', 'WLAN 空口（射频）利用率过高通常意味着？', ['无线信道拥塞、冲突与重传增加', '信号强度增强', '用户减少', '加密增强'], '无线信道拥塞、冲突与重传增加',
    '空口利用率高表示信道繁忙（大量数据/干扰/重传），会导致时延与丢包；需扩容 AP、调信道功率或减干扰。', 'wlan-rf', 'IP')
add('multiple', '华为 WLAN 网络的主要组成通常包括？', ['AC（接入控制器）', 'AP（接入点）', '终端 STA', '核心路由器（可选，用于出口）'],
    ['AC（接入控制器）', 'AP（接入点）', '终端 STA'], '园区 WLAN 由 AC 集中管理 Fit AP 与 STA 组成；核心路由器/防火墙是网络出口而非 WLAN 组件本身。', 'wlan-arch', 'IP')
add('judge', 'WLAN 的"本地转发"模式下，用户数据在 AP 处直接进出有线网络，不经过 AC 的 CAPWAP 数据隧道。', True,
    '本地（直接）转发：AP 直接桥接用户数据到本地 VLAN；集中（隧道）转发：数据经 CAPWAP 隧道送 AC 再出网。', 'wlan-arch', 'IP')
add('single', '802.11ac（Wi-Fi 5）引入的关键技术不包括？', ['OFDMA（用于 Wi-Fi 6）', 'MU-MIMO（下行多用户）', '波束成形 Beamforming', '更宽信道（80/160MHz）'], 'OFDMA（用于 Wi-Fi 6）',
    'OFDMA 是 Wi-Fi 6(802.11ax) 引入；802.11ac 用 MU-MIMO(下行)、波束成形、宽信道提升速率。', 'wlan-standard', 'IP')
add('single', 'WLAN 安全中，WPA/WPA2 个人版与企业的核心区别是？', ['认证方式：PSK 共享密钥 vs 802.1X+RADIUS 每用户凭证', '加密算法不同', '频段不同', '速率不同'],
    '认证方式：PSK 共享密钥 vs 802.1X+RADIUS 每用户凭证', '个人版用预共享密钥（PSK），企业版用 802.1X+EAP+RADIUS 实现每用户独立认证与计费。', 'wlan-security', 'IP', 'hot')
add('judge', 'WIDS/WIPS 可将检测到的非法 AP 标记为 rogue（恶意）、interfering（干扰）或 neighbor（友邻）进行分类处置。', True,
    'WIDS 对发现的 AP 分类：rogue(未授权/可疑)、interfering(外部干扰)、neighbor(已授权友邻)，据此告警或反制。', 'wlan-security', 'IE')
add('single', 'WLAN 容量规划时，单 AP 的并发用户数主要受限于？', ['空口吞吐、信道带宽与终端速率', '仅 AP 的 IP 地址数', '仅 VLAN 数量', '仅天线增益'], '空口吞吐、信道带宽与终端速率',
    'AP 容量由空口速率、信道带宽、并发用户行为（语音/视频/数据）共同决定；并非由地址或 VLAN 决定。', 'wlan-planning', 'IP')

# --- 安全进阶 ---
add('judge', '防火墙"安全策略"基于五元组/应用/用户等综合匹配并动作，优于早期仅基于 ACL 的域间包过滤。', True,
    '包过滤 ACL 只看五元组首包；安全策略可结合应用、用户、内容、威胁情报，更精细且默认拒绝跨区域。', 'security-firewall-basic', 'IP', 'hot')
add('single', 'IPSec 穿越 NAT 时使用的 NAT 探测与封装端口是？', ['UDP 4500（NAT-T）', 'UDP 500', 'TCP 443', 'UDP 4789'], 'UDP 4500（NAT-T）',
    'IKE 初始在 UDP 500；检测到 NAT 后切换 NAT-T，数据/控制封装在 UDP 4500 以穿透 NAT。', 'security-ipsec', 'IE', 'hot')
add('single', '等保 2.0 中，第三级（S3A3）相较第二级的核心强化是？', ['强制测评、更严的审计与入侵防范要求', '无需测评', '仅增加加密', '取消访问控制'], '强制测评、更严的审计与入侵防范要求',
    '等级越高要求越严：三级需通过等保测评、增强安全审计/入侵防范/集中管控，并落实"一个中心三重防护"。', 'security-management', 'IE')
add('single', '防火墙虚拟系统（Vsys）与 VRF（路由转发实例）的主要区别是？', ['Vsys 是防火墙虚拟化（含安全策略/会话隔离），VRF 是路由表虚拟化', '两者完全相同', 'Vsys 只做路由', 'VRF 做安全隔离'],
    'Vsys 是防火墙虚拟化（含安全策略/会话隔离），VRF 是路由表虚拟化', 'Vsys 在一台防火墙上虚拟多台逻辑防火墙（策略/会话/资源隔离）；VRF 仅隔离路由表，不做安全策略隔离。', 'security-fw-advance', 'IE')
add('judge', '内容安全中的 DLP（数据泄露防护）可基于关键字、指纹、文件类型识别并阻断敏感数据外发。', True,
    'DLP 结合正则/文档指纹/机器学习识别敏感信息（身份证/源码/财务），在邮件/Web/存储外发时拦截，防数据泄露。', 'security-utm', 'IE')
add('single', '防火墙双机热备中，HRP（Huawei Redundancy Protocol）的主要作用是？', ['在双机间同步会话表、配置与状态', '选举根桥', '分配 IP 地址', '做 NAT'],
    '在双机间同步会话表、配置与状态', 'HRP 在心跳线传输会话/配置同步；主备切换后业务会话不中断；VGMP 统一管理 VRRP 状态。', 'security-ha', 'IE', 'hot')
add('single', 'UTM/防火墙中，URL 过滤通常依据？', ['URL 分类库与自定义黑白名单', '仅 IP 地址', '仅 MAC 地址', '仅端口号'],
    'URL 分类库与自定义黑白名单', 'URL 过滤基于云端/本地分类库（新闻/社交/赌博等）与黑白名单，控制上网行为，需配合许可证。', 'security-utm', 'IP')
add('judge', '零信任（Zero Trust）的核心原则是"从不信任、持续验证"，访问前需对身份、设备、环境持续评估授权。', True,
    '零信任打破网络位置默认信任，所有访问均须认证、授权与加密，并基于持续评估动态调整权限。', 'security-concept', 'IE')
add('single', 'IPS 的"签名（特征）"与"例外（exception）"机制用于？', ['基于已知攻击特征检测，例外用于放行误报或特定流量', '加密流量', '分配 IP', '限速'],
    '基于已知攻击特征检测，例外用于放行误报或特定流量', 'IPS 靠签名库识别攻击；例外可放行特定源/目的或已知误报，避免业务中断，需谨慎配置。', 'security-ips', 'IP', 'hot')
add('single', '防火墙会话表项老化时间（aging-time）的作用是？', ['回收长期无数据的会话，释放资源', '加快转发', '加密会话', '限制并发'],
    '回收长期无数据的会话，释放资源', '会话表对新建连接维护状态与老化；无数据超时才删除，避免表项无限增长；老化过短会断长连接。', 'security-firewall', 'IP')
add('judge', 'Syslog 可将防火墙/设备的日志外发到日志服务器集中存储与分析，满足等保审计留存要求。', True,
    'Syslog（UDP 514/TCP）把安全事件、会话、威胁日志外发到 SIEM/日志服务器，集中留存与关联分析。', 'security-management', 'IP')
add('single', '安全运维中，依据"最小权限原则"应？', ['仅授予完成工作所必需的最小权限', '授予全部权限', '默认放行所有', '关闭审计'],
    '仅授予完成工作所必需的最小权限', '最小权限（Least Privilege）是安全基本原则：账号/策略只给必要权限，降低越权与横向移动风险。', 'security-concept', 'IA', 'hot')
add('multiple', '数据中心/园区网络常见的"东西向"安全（微隔离）手段包括？', ['防火墙虚拟系统 Vsys 策略', '安全组/微分段', '业务间 ACL 隔离', '仅依赖边界防火墙'],
    ['防火墙虚拟系统 Vsys 策略', '安全组/微分段', '业务间 ACL 隔离'], '东西向（服务器间）流量防护靠微隔离/微分段/Vsys 策略/ACL，不能仅靠边界防火墙；边界只防南北向。', 'security-fw-advance', 'IE')

# ============================ 校验与输出 ============================
def ts_escape(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def validate():
    bad = [q for q in Q if q['kid'] not in KNOWN]
    for q in bad:
        print('[WARN] 未知 knowledgeId:', q['kid'], '|', q['q'][:30])
    for q in Q:
        if q['type'] in ('single', 'multiple'):
            opts = q['options']
            ans = q['answer']
            if isinstance(ans, list):
                for a in ans:
                    if a not in opts:
                        print('[ERR] 多选答案不在选项中:', q['q'][:30], a)
            else:
                if ans not in opts:
                    print('[ERR] 单选答案不在选项中:', q['q'][:30], ans)

def emit(path):
    seen = set()
    uniq = []
    for q in Q:
        k = q['q'].strip()
        if k in seen:
            continue
        seen.add(k)
        uniq.append(q)
    counters = {'datacom': 0, 'security': 0, 'wlan': 0, 'dcn': 0}
    dir_code = {'datacom': 'dc', 'security': 'se', 'wlan': 'wl', 'dcn': 'dn'}
    lines = ["// 自动生成：华为ICT大赛网络赛道题库扩充（第十届/实践赛，对齐官方考纲权重）",
             "// 由 scripts/gen_questions.py 离线生成，请勿手工编辑",
             "import type { IQuizQuestion } from './quizzes'",
             "",
             "export const EXTRA_QUIZZES_D: IQuizQuestion[] = ["]
    for q in uniq:
        counters[q['direction']] += 1
        nid = f"nx-{dir_code[q['direction']]}-{counters[q['direction']]:03d}"
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
    emit(os.path.join(REPO, 'src/data/quizzes-extra-d.ts'))
