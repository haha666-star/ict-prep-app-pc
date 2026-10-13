/**
 * 「巧妙记忆」口诀库（按知识点挂载）
 *
 * 用途：解析面板最底部多一个「巧妙记忆」区块，把这一知识点的**骨架**压缩成一句口诀，
 *       用来回答「这题我记不住怎么办」。参考上面的结论 + 要点先理解，再用口诀把结论压成一句话背下来。
 *
 * 约定：
 *   1) key 必须是**已存在的 knowledgeId**（超集会被 `probe-explain.mjs` 的孤儿键断言拦下）；
 *   2) 值一律为「事实性压缩」，不编造知识点；数字/顺序类口诀要与正文一致；
 *   3) 一条一句话，尽量 ≤ 60 字，能上口为佳。
 *
 * 2026-10-13 新增：原先题库的 `tip` / `pitfall` 字段（当时全库 964 题）**全为空**，
 *   所以解析面板底部的「记忆要点」区块从未渲染过 —— 这个文件补上那个位置。
 */

export const MNEMONIC_BY_KNOWLEDGE: Record<string, string> = {
  // ==================== 数通 ====================
  datacom: '数通就四件事：二层通（VLAN/STP）→ 三层通（路由）→ 出口通（NAT/ACL）→ 不断线（VRRP/BFD）。',
  'datacom-basic': '网络三要素：连得上（连通）、找得到（寻址）、传得稳（可靠）——所有题都往这三点上靠。',
  'datacom-osi-tcpip': 'OSI 七层自下而上「物数网传会表应」；TCP/IP 四层只留「网接→网际→传输→应用」。',
  'datacom-ip-subnet': '先算块大小（256−掩码字节）→ 网段按块起点对齐 → 末位是广播 → 可用数 = 块大小−2。',
  'datacom-arp': 'ARP 三句话：请求广播发、应答单播回、结果进缓存；免费 ARP 用来查冲突。',
  'datacom-lan': '交换机转发三句：查表有则单播、无则泛洪、收到先学源 MAC。',
  'datacom-ethernet': '以太网帧「六四五一八」：最小 64 字节、最大 1518 字节。',
  'datacom-vlan': 'Access 只打一个标签、Trunk 允许一串标签、Hybrid 想打谁打谁；未打标签帧由 PVID 接管。',
  'datacom-stp': 'STP 选举顺序：选根桥（BID 最小）→ 根端口 → 指定端口 → 其余阻塞；比序：根桥ID→开销→BID→端口ID。',
  'datacom-mstp': 'MSTP 一句话：不同 VLAN 走不同拓扑，一实例一棵树，实例 0 永远在。',
  'datacom-eth-trunk': 'Eth-Trunk：两端模式必须一致（手工/LACP），成员口速率双工必须相同。',
  'datacom-link-aggregation': '链路聚合 = 带宽叠加 + 冗余：断一条不断整体，M 条里最多坏 M−1 条。',
  'datacom-stack': '堆叠（iStack/CSS）把多台设备当一台管：选主备 + 统一管理地址。',
  'datacom-routing': '路由三来源优先级：直连 > 静态 > 动态；查表先比掩码长度（最长匹配）。',
  'datacom-static-route': '静态路由写两样：目的网段/掩码 + 下一跳或出接口；默认路由 0.0.0.0/0。',
  'datacom-ospf': 'OSPF 邻居状态「下初双交装，加载才 Full」；DR/BDR 选举发生在 2-Way 之后。',
  'datacom-ospfv3': 'OSPFv3 用链路本地地址跑邻居；认证交给 IPSec；LSA 在 v2 的基础上多了 8/9 两类。',
  'datacom-isis': 'IS-IS 三种路由器：L1 管内、L2 管间、L1/2 相当于 ABR；NET = 区域+System ID+NSEL。',
  'datacom-bgp': 'BGP 建邻居六状态「空连活开确建」；选路先看权重/本地优先级，再看 AS_Path 长短。',
  'datacom-bgp4plus': 'BGP4+ 就是跑 IPv6 的 BGP：地址族写在 MP_REACH_NLRI 里，下一跳换成 IPv6 地址。',
  'datacom-route-policy': '分清两件事：Filter-Policy 只管「放不放行」，Route-Policy 才能「改属性」。',
  'datacom-policy-route': 'PBR 是「先定转发再查表」，优先级 接口 PBR > 本地 PBR > 路由表。',
  'datacom-ipv6': 'IPv6 三点：128 位、双冒号压缩连续 0 只能用一次、链路本地 FE80::/10。',
  'datacom-ipv6-basic': 'IPv6 无广播只组播（FF00::/8）、无 ARP 改 NDP（NS/NA），地址自动配置靠 RA。',
  'datacom-acl': 'ACL 数字记档位：基本 2000~2999 只看源、高级 3000~3999 看五元组、二层 4000~4999 看 MAC。',
  'datacom-nat': 'NAT 两个方向：出方向 Easy IP（借接口地址）、入方向 NAT Server（一对一映射）。',
  'datacom-vrrp': 'VRRP：虚拟出一个 IP+MAC，优先级大者当 Master（默认 100），「谁大谁当主」。',
  'datacom-dhcp': 'DHCP 四步口诀 DORA：Discover-Offer-Request-Ack（发现→提供→请求→确认）。',
  'datacom-tcp-udp': 'TCP 三次握手 SYN→SYN/ACK→ACK；四次挥手因为「半关闭」；TIME_WAIT 等 2MSL。',
  'datacom-application-layer': '端口串记：FTP 20/21、SSH 22、Telnet 23、DNS 53、HTTP 80、HTTPS 443。',
  'datacom-service': '网络服务按端口背：53 域名、67/68 地址、20/21 文件、22 安全登录、23 明文登录。',
  'datacom-rip': 'RIP 三个数：最多 15 跳、16 算不可达、30 秒播一次；防环靠水平分割 + 毒性逆转。',
  'datacom-bfd': 'BFD = 毫秒级心跳：与协议无关，两端都要配，本地标识与远端标识成对出现。',
  'datacom-mpls': 'MPLS 标签 4 字节「二零三一八」：Label 20 位 + EXP 3 位 + S 1 位 + TTL 8 位。',
  'datacom-mpls-basic': 'MPLS 转发只看标签不看 IP；三种标签动作：push 压入、swap 交换、pop 弹出。',
  'datacom-mpls-vpn': 'MPLS VPN 三件套：VRF 隔离路由、RD 区分相同私网地址、RT 控制路由收发。',
  'datacom-gre-l2tp': 'GRE 是三层隧道（能跑组播）、L2TP 是二层拨号隧道，两者叠起来就是常见 VPN。',
  'datacom-qos': 'QoS 流程四步：分类 → 标记 → 排队（拥塞管理）→ 丢弃（拥塞避免）；DiffServ 用 DSCP 标记。',
  'datacom-qos-basic': '队列记住三档：EF 给语音（低时延）、AF 分四级三档、BE 是默认尽力而为。',
  'datacom-vlan-aggregate': 'Super-VLAN 聚合子 VLAN 省地址：只有 Super-VLAN 配网关，子 VLAN 只负责隔离广播。',
  'datacom-nms': '网管五功能「配故性安计」：配置、故障、性能、安全、计费。',

  // ==================== 安全 ====================
  security: '安全记五个字：认（认证）、控（策略）、察（检测）、密（加密）、录（日志）。',
  'security-basic': '安全三要素 CIA：机密性（看不懂）、完整性（改不了）、可用性（用得上）。',
  'security-concept': '安全三要素 CIA + 不可否认性 = 四性；风险 = 威胁 × 脆弱性。',
  'security-crypto': '对称快但密钥难分发（AES）、非对称慢但能签名（RSA）、哈希不可逆（SHA）——「快慢逆」三字记全。',
  'security-firewall': '防火墙三区：Trust / Untrust / DMZ；策略自上而下匹配，命中即停。',
  'security-firewall-basic': '防火墙默认规矩：同安全区域放行、不同区域拒绝，所以跨区必须写策略。',
  'security-nat': '源 NAT 管出方向、目的 NAT 管入方向（NAT Server）；PAT 多对一、No-PAT 一对一。',
  'security-ha': '双机热备两条线：心跳线跑 HRP + 业务线跑流量；主备切换看 HRP 状态。',
  'security-management': '运维四板斧：账号分权、日志留痕、配置备份、补丁升级。',
  'security-attack-defense': '防 DDoS 三招：限速、过滤、清洗；防 ARP 欺骗用 DHCP Snooping + 静态绑定。',
  'security-vpn': 'VPN 三兄弟：IPSec 在三层、SSL 在七层（免客户端）、GRE/L2TP 是隧道。',
  'security-ipsec': 'IPSec 两阶段：一阶段建管理隧道（IKE，主/野蛮模式）、二阶段建数据隧道；ESP 加密、AH 只认证。',
  'security-ssl-vpn': 'SSL VPN 三种模式：Web 代理（改链接）、网络扩展（改路由）、端口转发（只转端口）。',
  'security-ips': 'IDS 只旁路告警、IPS 在线阻断 ——「D 不动手，P 会动手」。',
  'security-ips-ids': '签名检测准（认已知）、异常检测灵（抓未知），两者互补不替代。',
  'security-antivirus': '内容安全三件套：反病毒（清文件）、URL 过滤（拦站点）、文件过滤（按类型拦）。',
  'security-utm': 'UTM 是「防火墙 + IPS + 反病毒 + URL 过滤」装一台；NGFW 再加应用识别与用户识别。',
  'security-auth': '认证三要素：你知道的（密码）、你有的（令牌）、你是什么（指纹）；AAA = 认证/授权/计费。',
  'security-8021x': '802.1X 三角色：客户端、设备（认证者）、RADIUS 服务器；设备只负责转发 EAP。',
  'security-pki': 'PKI 三步：CA 签发证书（公钥与身份绑定）→ 验签 → 吊销走 CRL/OCSP。',
  'security-dhcp-snooping': 'DHCP Snooping 先划「信任口」：只信连着 DHCP 服务器的那个口；IPSG 靠绑定表拦私设 IP。',
  'security-port-security': '端口安全三件事：限 MAC 数量、绑定 MAC、违规动作（protect/restrict/shutdown 依次变严厉）。',
  'security-portal': 'Portal 三步：重定向到门户 → 在门户认证 → 放行上网；访客与微信认证都靠它。',
  'security-fw-advance': '虚拟系统 = 一台物理墙切成多台逻辑墙；智能选路 = 按链路质量选出口。',

  // ==================== WLAN ====================
  wlan: 'WLAN 一条线：AP 上线（CAPWAP）→ 下发 VAP → STA 关联 → 认证 → 拿 IP。',
  'wlan-basic': 'WLAN 三件套：AP 发信号、AC 管 AP、STA 上网；CAPWAP 同时跑控制与数据。',
  'wlan-standard': '标准配频段：11b/g 在 2.4G、11a/n/ac 在 5G、11ax 双频、11be 再加 6G。',
  'wlan-arch': '三种组网形态：胖 AP 自治、瘦 AP+AC 集中、云 AP；转发只有隧道与直接两种。',
  'wlan-service': 'WLAN 安全三代：WEP（已废）→ WPA/WPA2（PSK 或 802.1X）→ WPA3（SAE）。',
  'wlan-vap': '层层套娃记：射频 → AP → VAP → SSID；一个 VAP 一个 SSID 一套安全策略。',
  'wlan-security': 'WPA2 两模式：PSK 家用（预共享密钥）、802.1X 企业（RADIUS 认证）；WPA3 用 SAE 防字典攻击。',
  'wlan-roaming': '漫游分两层：同网段二层漫游、跨网段三层漫游（要隧道或 AC 间漫游组）。',
  'wlan-qos': 'WLAN QoS 靠 WMM 四档：语音 > 视频 > 尽力 > 背景，EDCA 抢信道。',
  'wlan-rf': '2.4G 只有 1/6/11 三个不重叠信道；「2.4G 穿墙、5G 快」，天线增益靠波束成形。',
  'wlan-wifi6': 'Wi-Fi 6 五卖点「O-M-Q-C-T」：OFDMA、上下行MU-MIMO、1024-QAM、BSS着色、TWT。',
  'wlan-sta-online': 'STA 上线四步：扫描 → 认证 → 关联 → DHCP 拿地址；AP 得先跟 AC 建好 CAPWAP 隧道。',
  'wlan-planning': '无线规划三步：勘测定 AP 位置 → 仿真定信道功率 → 上线后射频调优。',

  // ==================== DCN ====================
  dcn: 'DCN 三关键词：Spine-Leaf（架构）、VXLAN（大二层）、EVPN（控制面）。',
  'dcn-basic': '数据中心三特征：高带宽、低时延、易扩展；「东西向流量远超南北向」。',
  'dcn-arch': '架构从三级（接入-汇聚-核心）变两级（Leaf-Spine）；大二层靠 VXLAN，控制面靠 EVPN。',
  'dcn-clos': 'Spine-Leaf 口诀：Leaf 接服务器、Spine 只连 Leaf；任意两台 Leaf 之间恒为 2 跳。',
  'dcn-vxlan': 'VXLAN 就是 MAC in UDP：外层 IP + UDP + VXLAN 头；VNI 24 位能装约 1600 万个网段。',
  'dcn-vxlan-basic': 'VXLAN 三层封装：外层 IP（VTEP 地址）+ UDP 4789 + VNI（24 位）。',
  'dcn-vxlan-gateway': '集中式网关三跳、分布式网关两跳；分布式用 Anycast 网关，主机本地就近转发。',
  'dcn-evpn': 'EVPN 用 BGP 传 MAC/IP：Type2 主机、Type3 组播、Type5 前缀，靠它替掉泛洪。',
  'dcn-sdn': 'SDN 三层解耦：应用层、控制层、转发层；北向对应用、南向对设备。',
  'dcn-sdn-basic': 'SDN 三句话：转控分离、集中控制、开放接口；南向 OpenFlow、北向 RESTful。',
  'dcn-sdn-controller': '控制器三能力：看拓扑、算路径、下流表；编排就是把业务语言翻译成网络配置。',
};

/** 取某知识点的巧记（无则返回空串） */
export function mnemonicOf(knowledgeId?: string): string {
  if (!knowledgeId) return '';
  return MNEMONIC_BY_KNOWLEDGE[knowledgeId] ?? '';
}
