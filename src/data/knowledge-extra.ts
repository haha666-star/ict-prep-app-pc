// EXPORTS: EXTRA_KNOWLEDGE
// 补齐题库中已引用但未定义的知识点（悬空 knowledgeId），并覆盖大纲要求但题库空白的方向
import type { IKnowledge } from './knowledge'

export const EXTRA_KNOWLEDGE: IKnowledge[] = [
  {
    id: 'datacom-tcp-udp',
    name: 'TCP与UDP',
    direction: 'datacom',
    parentId: 'datacom-basic',
    level: 3,
    keyPoints: [
      'TCP：面向连接、可靠传输、三次握手与四次挥手、滑动窗口、拥塞控制（慢启动/拥塞避免/快重传/快恢复）',
      'UDP：无连接、不可靠、开销小、时延低，适合语音视频与实时业务',
      '常见端口：HTTP 80/TCP、HTTPS 443/TCP、FTP 20-21/TCP、SSH 22/TCP、Telnet 23/TCP、DNS 53/UDP+TCP、DHCP 67-68/UDP、SNMP 161-162/UDP',
      '常见协议号：ICMP 1、TCP 6、UDP 17、OSPF 89、ESP 50、AH 51',
      'TCP 与 UDP 均提供端口号字段实现复用与分用'
    ],
    tips: '端口号与协议号是必考识记点，注意区分"端口号（传输层）"与"协议号（IP 层）"'
  },
  {
    id: 'datacom-application-layer',
    name: '应用层协议',
    direction: 'datacom',
    parentId: 'datacom-basic',
    level: 3,
    keyPoints: [
      'HTTP/HTTPS：Web 访问，HTTPS = HTTP + TLS，端口 80/443',
      'DNS：域名解析，端口 53，递归查询与迭代查询，常见记录 A/AAAA/CNAME/MX',
      'FTP：文件传输，控制连接 21，数据连接 20（主动模式）',
      'DHCP：动态主机配置，UDP 67/68，DORA 四步交互',
      'SMTP/POP3/IMAP：邮件收发，端口 25/110/143'
    ],
    tips: '重点记端口与协议对应关系，以及 DNS、DHCP 的交互流程'
  },
  {
    id: 'datacom-rip',
    name: 'RIP 路由协议',
    direction: 'datacom',
    parentId: 'datacom-routing',
    level: 3,
    keyPoints: [
      '距离矢量协议，以跳数为度量值，最大 15 跳，16 跳表示不可达',
      'RIPv1：有类路由协议，广播更新，不支持 VLSM 与认证',
      'RIPv2：无类路由协议，组播更新 224.0.0.9，支持 VLSM、CIDR 与明文/MD5 认证',
      'RIPng：用于 IPv6，基于 UDP 521',
      '防环机制：水平分割、毒性逆转、触发更新、抑制计时器、最大跳数'
    ],
    tips: 'RIP 已在现网中基本被 OSPF/IS-IS 取代，但作为距离矢量典型代表仍是高频概念考点'
  },
  {
    id: 'datacom-bfd',
    name: 'BFD 双向转发检测',
    direction: 'datacom',
    parentId: 'datacom-routing',
    level: 3,
    keyPoints: [
      '轻量级快速故障检测机制，可提供毫秒级故障感知',
      '与 OSPF、IS-IS、BGP、VRRP、静态路由、MPLS 等联动，加速业务收敛',
      '会话建立后周期性发送检测报文，支持异步模式与查询模式',
      '可配置最小发送间隔、最小接收间隔与检测倍数',
      'BFD 只负责检测，不参与路由计算'
    ],
    tips: '常考"BFD 的作用与联动对象"，注意 BFD 本身不做选路'
  },
  {
    id: 'datacom-link-aggregation',
    name: '链路聚合',
    direction: 'datacom',
    parentId: 'datacom-lan',
    level: 3,
    keyPoints: [
      'Eth-Trunk 将多条物理链路捆绑为一条逻辑链路，提升带宽并实现冗余',
      '手工模式：不运行 LACP，由管理员静态捆绑',
      'LACP 模式：通过 LACPDU 协商，选举主动端并确定活动/备份链路',
      '成员端口的速率、双工模式、VLAN 配置必须一致',
      '跨设备链路聚合可由堆叠/CSS 或 M-LAG 实现'
    ],
    tips: '注意华为 Trunk 端口默认不放行所有 VLAN，链路聚合成员口配置一致性是高频考点'
  },
  {
    id: 'security-ha',
    name: '防火墙双机热备',
    direction: 'security',
    parentId: 'security-firewall',
    level: 3,
    keyPoints: [
      '主备备份与负载分担两种部署模式',
      '通过 HRP（Huawei Redundancy Protocol）同步会话表、配置与状态',
      'VGMP（VRRP Group Management Protocol）统一管理 VRRP 组状态，避免主备不一致',
      '心跳线用于传输 HRP 报文与状态同步',
      '支持配置自动同步与抢占'
    ],
    tips: '双机热备核心是"会话表同步"，否则主备切换会导致业务中断，VGMP 与 HRP 的分工是难点'
  },
  {
    id: 'security-management',
    name: '安全管理与运维',
    direction: 'security',
    parentId: 'security-basic',
    level: 3,
    keyPoints: [
      '等保 2.0：五个安全保护等级，"一个中心、三重防护"技术框架',
      '三重防护：安全通信网络、安全区域边界、安全计算环境',
      'RTO（恢复时间目标）与 RPO（恢复点目标）的含义与关系',
      '日志集中收集、统一 NTP 时钟源、日志防篡改与留存（不少于 6 个月）',
      '漏洞管理闭环：扫描→评估→排序→验证→灰度→复测'
    ],
    tips: '等保框架与 RTO/RPO 是近年新增的高频考点，注意两者数值越小代表要求越高'
  },
  {
    id: 'security-pki',
    name: 'PKI 与数字证书',
    direction: 'security',
    parentId: 'security-crypto',
    level: 3,
    keyPoints: [
      'PKI 组成：CA、RA、证书库、密钥管理、证书吊销（CRL/OCSP）',
      '数字证书由 CA 签发，绑定公钥与持有者身份',
      '数字签名：发送方用私钥对摘要加密，接收方用公钥验签，提供完整性与不可否认性',
      '典型应用：HTTPS、IPsec 证书认证、802.1X EAP-TLS',
      '非对称算法 RSA/ECC 用于签名与密钥交换，对称算法 AES 用于数据加密'
    ],
    tips: '重点理解"私钥签名、公钥验签"与"公钥加密、私钥解密"两种用法的区别'
  },
  {
    id: 'security-utm',
    name: 'UTM 与下一代防火墙',
    direction: 'security',
    parentId: 'security-firewall',
    level: 3,
    keyPoints: [
      'UTM：将防火墙、IPS、AV、URL 过滤等集成于一台设备',
      'NGFW 在 UTM 基础上增强应用识别与控制、用户身份关联与内容安全',
      '典型功能：应用识别、IPS、AV、URL 过滤、内容过滤、DLP、沙箱联动',
      '与传统包过滤/状态检测的区别在于具备应用层深度检测能力',
      '通常需与态势感知平台联动实现协同防御'
    ],
    tips: 'UTM 与 NGFW 的区别常考：NGFW 强调应用识别、用户感知与内容级防护'
  },
  {
    id: 'dcn-vxlan-gateway',
    name: 'VXLAN 网关',
    direction: 'dcn',
    parentId: 'dcn-vxlan',
    level: 3,
    keyPoints: [
      '集中式网关：网关部署在 Spine 或专用网关设备，便于集中安全策略，但存在流量绕行与性能瓶颈',
      '分布式网关：网关下沉到 Leaf，多台 Leaf 配置相同的 Anycast IP 与 MAC，实现就近转发',
      '分布式网关适合东西向流量为主的中大型数据中心',
      'Anycast Gateway 需配合主机路由（/32）保证流量对称',
      '对称 IRB 与非对称 IRB 的流量路径差异'
    ],
    tips: '高频易错点：分布式网关配置更复杂、安全策略分散（不是更简单更安全）；集中式网关存在次优路径'
  },
  {
    id: 'wlan-rf',
    name: 'WLAN 射频与天线',
    direction: 'wlan',
    parentId: 'wlan-basic',
    level: 3,
    keyPoints: [
      '2.4GHz 中国可用信道 1-13，互不重叠信道为 1/6/11，每信道 20MHz',
      '5GHz 信道资源丰富、干扰少、速率高，但穿透与绕射能力弱于 2.4GHz',
      '全向天线适合开阔区域，定向天线适合走廊、隧道等狭长场景',
      '天线增益越高方向性越强，覆盖范围并非一定更大',
      '射频优化手段：信道规划、功率调整、频谱导航（频段引导）、负载均衡'
    ],
    tips: '易错点：AP 功率并非越大越好，功率过大会导致同频干扰加剧与漫游粘滞'
  },
  {
    id: 'wlan-wifi6',
    name: 'Wi-Fi 6（802.11ax）',
    direction: 'wlan',
    parentId: 'wlan-standard',
    level: 3,
    keyPoints: [
      'OFDMA：划分资源单元 RU，实现多用户并行传输，降低时延',
      '上下行 MU-MIMO：支持多用户同时收发',
      '1024-QAM：相比 Wi-Fi 5 的 256-QAM 提升约 25% 速率',
      'BSS Coloring：通过着色区分同信道 BSS，提升空间复用',
      'TWT 目标唤醒时间：终端按需唤醒，显著降低功耗',
      'Wi-Fi 6 同时支持 2.4GHz 与 5GHz，Wi-Fi 6E 扩展至 6GHz'
    ],
    tips: 'OFDMA 与 MU-MIMO 的区别是高频考点：OFDMA 解决多用户小包并发效率，MU-MIMO 解决多用户空间流并行'
  },

  // ============ 第十届大纲缺口补齐（深圳赛区细则 + 国赛权重重排）============
  {
    id: 'datacom-mstp',
    name: 'MSTP 多生成树',
    direction: 'datacom',
    parentId: 'datacom-lan',
    level: 3,
    keyPoints: [
      'MSTP（IEEE 802.1s）在 RSTP 基础上引入实例（Instance）与域（Region），不同 VLAN 可映射不同生成树实例',
      'MST 域需 Region 名称、修订级别、VLAN-实例映射三者完全一致才能属于同一域',
      'IST（内部生成树）连接所有 MST 域，CST（公共生成树）连接所有 STP 域，CIST 为二者总和',
      'MSTP 既防环又实现 VLAN 级负载分担，优于单棵 STP/RSTP',
      '关键命令：stp mode mstp、stp region-configuration、instance vlan'
    ],
    tips: 'MSTP 域三要素一致性与"实例-VLAN 映射"是必考，注意 MSTP 兼容 RSTP/STP'
  },
  {
    id: 'datacom-vlan-aggregate',
    name: 'VLAN 聚合（Super-VLAN）',
    direction: 'datacom',
    parentId: 'datacom-vlan',
    level: 3,
    keyPoints: [
      'Super-VLAN（VLAN 聚合）用一个三层 VLANIF 接口为多个 Sub-VLAN 提供网关，节省 IP 地址',
      'Sub-VLAN 之间二层隔离，借助 Super-VLAN 的 VLANIF 实现三层互通',
      'ARP 代理（arp-proxy intra-sub-vlan-proxy）使 Sub-VLAN 间可经 Super-VLAN 网关互访',
      'Super-VLAN 不能包含物理端口，端口只能加入 Sub-VLAN',
      '典型场景：园区大量隔离用户共享同一网段网关'
    ],
    tips: '易错点：Sub-VLAN 间二层不通，必须开启 VLAN 间 ARP 代理才能三层互通'
  },
  {
    id: 'datacom-policy-route',
    name: '策略路由 PBR',
    direction: 'datacom',
    parentId: 'datacom-routing',
    level: 3,
    keyPoints: [
      'PBR 按管理员策略（源/目的 IP、协议、端口等）转发，优先级高于普通路由表',
      '通过流分类（traffic classifier）、流行为（traffic behavior）、流策略（traffic policy）重定向下一跳或出接口',
      '与路由策略（route-policy）区别：route-policy 过滤/修改路由，PBR 控制数据转发',
      'PBR 常用于引流、负载分担、出口选路、旁挂设备引流',
      '本地 PBR 作用于本机发出的报文，接口 PBR 作用于过境报文'
    ],
    tips: '高频易混：route-policy 管"路由"，PBR 管"报文转发"，二者作用层次不同'
  },
  {
    id: 'datacom-nms',
    name: '网络管理与运维',
    direction: 'datacom',
    parentId: 'datacom-service',
    level: 3,
    keyPoints: [
      'SNMP：网管协议，v1/v2c 基于团体字（明文），v3 支持认证与加密；代理 Agent 161/162',
      'LLDP：链路层发现协议，用于邻居设备信息发现，与厂商无关的二层邻居发现',
      'NQA：网络质量分析，探测时延/抖动/丢包（ICMP/TCP/HTTP 等），可与静态路由、PBR 联动实现探测联动',
      'NetStream/sFlow：流量采样与统计分析',
      'telemetry：实时采集设备数据，相比 SNMP 轮询更实时'
    ],
    tips: 'SNMP 版本安全差异与 NQA 联动是易考点，注意 SNMP v3 才具备加密'
  },
  {
    id: 'security-dhcp-snooping',
    name: 'DHCP Snooping 与 IPSG',
    direction: 'security',
    parentId: 'security-basic',
    level: 3,
    keyPoints: [
      'DHCP Snooping 建立合法 DHCP 绑定表（MAC-IP-端口-VLAN），区分信任/非信任端口',
      '非信任端口收到的 DHCP Offer/Ack 被丢弃，防止私接 DHCP 服务器（DHCP 欺骗）',
      'IP Source Guard（IPSG）基于绑定表校验 IP+MAC，非法报文丢弃',
      '动态 ARP 检测（DAI）基于绑定表校验 ARP 报文，防 ARP 欺骗',
      '配置：dhcp snooping enable、trust 接口、ip source check user-bind'
    ],
    tips: '三者联动是二层防攻击标准方案：Snooping 建表，IPSG 防 IP 欺骗，DAI 防 ARP 欺骗'
  },
  {
    id: 'security-port-security',
    name: '端口安全与 MAC 安全',
    direction: 'security',
    parentId: 'security-basic',
    level: 3,
    keyPoints: [
      '端口安全（Port Security）限制端口学习 MAC 数量，超阈可 protect/restrict/error-down',
      '端口安全可绑定合法 MAC（sticky 或手工），实现接入准入',
      'MAC 地址漂移检测：同一 MAC 在不同端口间跳变触发告警或阻塞，防环路与攻击',
      '端口隔离（port-isolate）：同隔离组端口二层不互通，节省 VLAN',
      'MACsec：基于 802.1AE 的链路层加密，保护点对点链路数据机密性与完整性'
    ],
    tips: '端口安全三种违规动作差异常考：protect 静默丢弃、restrict 丢弃并告警、error-down 关闭端口'
  },
  {
    id: 'security-portal',
    name: 'Portal 认证',
    direction: 'security',
    parentId: 'security-auth',
    level: 3,
    keyPoints: [
      'Portal 认证（Web 认证）：用户先免认证访问 Portal 页面，输入账号后上线',
      '三层 Portal（直接转发）与二层 Portal（VLAN 内），需 Portal 服务器与 RADIUS 配合',
      '常与 802.1X、MAC 认证组成统一准入，按场景组合（如 802.1X 失败降级 Portal）',
      '典型应用：访客接入、校园/园区 Web 自助认证',
      '相比 802.1X 无需客户端，用户体验友好但安全性略低'
    ],
    tips: '三种准入（802.1X/MAC/Portal）的适用场景对比是高频题，Portal 胜在无客户端'
  },
  {
    id: 'security-fw-advance',
    name: '防火墙虚拟系统与智能选路',
    direction: 'security',
    parentId: 'security-firewall',
    level: 3,
    keyPoints: [
      '虚拟系统（Vsys）：一台物理防火墙虚拟为多台逻辑防火墙，资源与配置隔离，节约成本',
      'Vsys 通过根系统分配资源（会话/策略/带宽），互不影响',
      '智能选路：基于链路质量（时延/丢包/带宽）自动选择最优出口，支持策略路由与链路负载均衡',
      '流量管理（带宽管理）：基于应用/用户/时间段做带宽限速与保障',
      '双链路热备、N+1 备份提升可靠性'
    ],
    tips: 'Vsys 与 VRF 概念不同：Vsys 是防火墙虚拟化，VRF 是路由虚拟化；智能选路核心是链路质量探测'
  },
  {
    id: 'wlan-sta-online',
    name: 'CAPWAP 与 STA 上线',
    direction: 'wlan',
    parentId: 'wlan-arch',
    level: 3,
    keyPoints: [
      'CAPWAP 隧道：控制隧道（UDP 5246）与数据隧道（UDP 5247）分离',
      'Fit AP 上线流程：DHCP 获取 IP → 发现 AC（广播/单播/Option 43/DNS）→ 建立 CAPWAP → 下载配置 → 运行',
      'STA 关联上线：扫描→认证→关联→DHCP→IP 获取→上网',
      'AC 发现方式：二层广播、三层单播、DHCP Option 43、DNS 域名',
      'AP 工作模式：Fit（受 AC 管理）、Fat（独立）、云管理'
    ],
    tips: 'CAPWAP 两端口（5246 控制/5247 数据）与 AP 发现 AC 的四种方式是高频考点'
  },
  {
    id: 'wlan-planning',
    name: '无线规划与部署',
    direction: 'wlan',
    parentId: 'wlan-basic',
    level: 3,
    keyPoints: [
      '信道规划：2.4G 用 1/6/11 互不重叠，5G 自动/手动选无干扰信道',
      '功率调整：避免过覆盖导致同频干扰与漫游粘滞，也要避免覆盖盲区',
      '频谱导航（Band Steer）：引导双频终端优先 5G，分流 2.4G 拥塞',
      '容量规划：单 AP 并发用户数、吞吐与覆盖半径的平衡',
      '高密场景：降低功率、缩小蜂窝、启用负载均衡'
    ],
    tips: '规划核心矛盾：功率过大→干扰与粘滞；功率过小→盲区；需折中'
  },
  {
    id: 'dcn-clos',
    name: 'Spine-Leaf 架构',
    direction: 'dcn',
    parentId: 'dcn-arch',
    level: 3,
    keyPoints: [
      'Clos/Spine-Leaf（胖树）是数据中心主流架构，Spine 与 Leaf 全互联',
      '东西向流量为主，任意 Leaf 间经过一跳 Spine，延迟可预测',
      'Leaf 连接服务器/防火墙，Spine 只做高速转发，无三层网关（Underlay）',
      'Overlay（VXLAN）在 Leaf 上提供二层扩展与租户隔离',
      '相比传统三层架构，Spine-Leaf 带宽利用率高、易横向扩展'
    ],
    tips: 'Spine-Leaf 的"任意 Leaf 间一跳 Spine"与东西向流量优化是核心卖点'
  },
  {
    id: 'dcn-sdn-controller',
    name: 'SDN 控制器与编排',
    direction: 'dcn',
    parentId: 'dcn-sdn',
    level: 3,
    keyPoints: [
      'SDN 核心思想：控制平面与转发平面分离，集中控制，开放可编程',
      '华为 SDN 控制器（如 iMaster NCE）负责网络自动化、策略下发与可视化',
      '南向接口：OpenFlow、NETCONF、OVSDB、BGP-EVPN；北向接口：RESTful API',
      'Underlay 提供 IP 互通，Overlay（VXLAN/EVPN）提供租户二层/三层网络',
      '控制器集群提升可靠性，避免单点故障'
    ],
    tips: 'SDN 三要素（转控分离/集中控制/开放接口）与南北向接口区分是必考'
  },

  // ===== 云/计算/存储类知识点（2026-11-07 新增，承接省赛真题的云网与算力考点）=====
  {
    id: 'dcn-server',
    name: '服务器硬件与接口',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "服务器三大件分工：CPU 负责运算与控制，内存（DRAM）在运算时临时存放程序指令、数据和中间结果（断电即失），硬盘负责持久化存储",
      "硬盘介质三类：HDD 机械硬盘（磁头寻道 + 盘片旋转，容量大、单位成本低、随机读写慢）、SSD 固态硬盘（NAND Flash，无机械部件，随机 IOPS 高）、SCM 存储级内存（非易失、接近内存的低时延，介于内存与 SSD 之间）",
      "NVMe 是面向 PCIe 总线的闪存访问协议，支持 SSD 与 SCM，不支持 HDD —— 机械盘靠寻道定位，NVMe 的并行队列优势无从发挥",
      "PCIe 插槽宽度（lane 数）规范内包含 x1、x2、x4、x8、x16、x32；链路可向下协商，x16 插槽可插 x4 卡",
      "存储连接形态：DAS 直连（服务器直接挂盘）、NAS 文件级（走 TCP/IP，NFS/CIFS 协议）、SAN 块级（FC SAN 走光纤通道、IP SAN 走 iSCSI）",
      "SAN 是存储区域网络（一种组网形态），不是硬盘介质；判断\"是否介质\"看它能不能直接存比特"
    ],
    tips: "介质与组网形态必须分清：HDD/SSD/SCM 是介质，DAS/NAS/SAN 是连接方式。NVMe 只面向闪存介质，判断题常在这里设陷阱"
  },
  {
    id: 'dcn-virtualization',
    name: '服务器虚拟化',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "Hypervisor（VMM，虚拟机监视器）负责在物理硬件与虚拟机之间做资源抽象与调度，是虚拟化的核心",
      "Type 1 裸金属型：Hypervisor 直接跑在硬件上，性能损耗小，生产环境主流（ESXi、Xen、KVM 内核态）",
      "Type 2 宿主型：Hypervisor 装在 Host OS 之上，部署方便但多一层开销（VirtualBox、VMware Workstation）",
      "四个角色别混：Host OS 宿主机操作系统、Guest OS 虚拟机内操作系统、Guest Machine 虚拟机本身、Hypervisor 监视器",
      "虚拟化管理平台：提供图形界面，负责监控与管理虚拟化资源池、简化虚拟机管理流程、配置资源调度策略与执行规则（如 FusionCompute 的 VRM）",
      "DVS 分布式虚拟交换机：把多台主机的虚拟交换功能统一管理。同端口组且同主机 → 直接经 DVS 二层转发；不同端口组（不同 VLAN）→ 需经上行链路到物理交换机；不同 DVS 即使 VLAN 相同 → 也必须经物理交换机，不能直通"
    ],
    tips: "Hypervisor 是\"监视器\"不是\"操作系统\"；DVS 跨主机通信必须落到物理网络，只有同主机同端口组才在本地二层转发"
  },
  {
    id: 'dcn-openstack',
    name: 'OpenStack 云平台组件',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "Keystone：统一身份认证与服务目录，所有组件之间的认证鉴权都依赖它 —— 谁调用谁先过 Keystone",
      "Nova：计算服务，负责虚拟机生命周期（创建/修改/删除）。创建时调用 Glance 取镜像、调用 Neutron 创建网络接口，自身不创建网卡",
      "Neutron：网络服务，抽象 Network（网络）、Subnet（子网）、Port（端口）、Router（路由器）；Core Plugin 提供 Network/Subnet/Port/Router，Service Plugin 提供 LB/FW/VPN 等扩展",
      "Neutron 的 Agent 部署在每个运行 Hypervisor 的主机上，负责本地虚拟交换机配置；L3 Agent 提供三层转发与 NAT；DHCP Agent 为租户网络动态分配 IP（不是静态分配）",
      "Cinder：块存储，为虚拟机提供可挂载的云硬盘，用于需要长期保存的持久化数据",
      "Swift：对象存储，面向海量非结构化数据，常用于存放虚拟机镜像、数据备份、归档",
      "Glance：镜像服务，提供镜像的发现、注册与检索。同一个镜像可以启动多个实例；在实例内的修改不会回写到镜像",
      "业务模型：一个 Project 内可包含多个 Router，一个 Router 可关联多个虚拟防火墙（不是一对一）"
    ],
    tips: "一句话串起来：Keystone 管\"你是谁\"，Glance 管\"装什么系统\"，Nova 管\"开机器\"，Neutron 管\"通不通\"，Cinder 管\"挂块盘\"，Swift 管\"存对象\""
  },
  {
    id: 'dcn-container',
    name: '容器与 Kubernetes',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "容器与虚拟机的本质差别：容器共享宿主机内核、不需要独立内核，因此镜像更小（MB 级）、启动更快（秒级）；但隔离性弱于虚拟机（VM 有独立内核与硬件虚拟化边界）",
      "Kubernetes 核心组件：kube-apiserver（唯一入口）、etcd（集群元数据存储）、kube-scheduler（调度到节点）、kube-controller-manager（控制器循环）、kubelet（节点代理）、kube-proxy（Service 转发）",
      "LoadBalancer 是 Service 的一种暴露类型（云厂商 LB），不是集群核心组件 —— 判断\"是否核心组件\"要分清组件与资源类型",
      "Calico：基于 BGP 的三层路由方案，把运行容器的服务器当成路由器跑 BGP；Felix 是每节点上的代理，负责把路由与 ACL 下发到内核，不负责存元数据（存元数据的是 etcd）",
      "Macvlan：Linux 内核特性、L2 桥接方案、Docker 原生支持；要求物理网卡开启混杂模式，容器网关落在物理交换机上，容器 IP 需手工规划管理，不自带地址自动分配",
      "大规模 Calico 组网用路由反射器（RR）收敛全网 Pod 路由，避免 BGP 全互联的 N 平方问题"
    ],
    tips: "容器\"轻\"来自共享内核，代价就是隔离性弱；K8s 组件题先排除 Service 类型（LoadBalancer/NodePort/ClusterIP）和附加组件（Ingress/Dashboard）"
  },
  {
    id: 'dcn-storage',
    name: '存储网络与 RDMA',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "三种存储形态对应三种访问粒度：DAS 直连块设备、NAS 文件级（NFS/CIFS over TCP/IP）、SAN 块级（FC SAN 或 iSCSI over IP）",
      "FC SAN 需要独立的光纤通道网络与 HBA 卡，性能稳定但成本高；IP SAN 复用以太网，成本低、易扩展",
      "存储网络对带宽与吞吐敏感；HPC 里对时延最敏感的是计算网络，业务管理网络对时延最不敏感",
      "RDMA：远程直接内存访问，网卡直接读写远端主机内存，实现内核旁路（kernel bypass）与零拷贝，CPU 几乎不参与数据搬运",
      "RDMA 的价值在于降低 CPU 负载与端到端时延，AI 训练、分布式存储、HPC 场景收益最大",
      "并行文件系统面向大规模高性能计算集群：大容量、高吞吐、易于动态扩容与统一管理；它的设计基础是并行 I/O 与元数据/数据分离，不是浏览器/服务器（B/S）模式"
    ],
    tips: "RDMA 的关键词是\"旁路内核 + 零拷贝 + 网卡直访内存\"，与之相反的描述（CPU 多次拷贝、内核反复参与）一定是错的"
  },
  {
    id: 'dcn-hpc-ai',
    name: 'HPC 与 AI 计算',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "HPC 四张网各司其职：计算网络（节点间 MPI 通信，InfiniBand 或高速以太，对时延要求最高）、存储前端网络（计算节点与存储节点之间）、存储后端网络（存储节点之间后台数据同步）、业务管理网络（管理、监控、登录，对时延最不敏感）",
      "节点角色：胖节点（多路 CPU + 大内存，跑大内存作业）、加速节点（装 GPU/NPU 做异构加速）、登录节点、管理节点",
      "多元计算三类：基础通用计算（CPU）、AI 计算（GPU/NPU/FPGA/ASIC 提供训练与推理算力）、高性能计算（超算集群）",
      "并非所有计算都需要无损网络：通用计算对丢包不敏感，AI 训练与分布式存储才需要无损以太（PFC/ECN）保障",
      "AI 产业分层：基础层（算力、芯片）、技术层（机器学习、深度学习、算法框架）、应用层（机器人、自动驾驶、语音识别）",
      "主流深度学习框架：华为主导的是 MindSpore；TensorFlow、PyTorch 为开源社区框架"
    ],
    tips: "HPC 四张网按\"对时延的敏感度\"排序记：计算 > 存储前端 > 存储后端 > 业务管理。题目问\"时延要求最低/最高\"先想这条链"
  },
  {
    id: 'dcn-cloudfabric',
    name: '云网一体化与业务链',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "VPC 模型层级：Project（资源单元）→ VPC（租户内隔离网络，一个租户可有多个）→ LogicalRouter → LogicalSwitch → Port；一个逻辑路由器可关联多个逻辑交换机",
      "业务链把 FW、LB、应用加速器、NAT 等统称为 SF（Service Function，服务功能）；SFF 是服务功能转发器，SFC 是服务功能链",
      "业务链两种实现：PBR（策略路由引流，控制器向 SC/SFF 下发过滤与重定向策略，逐跳引流）、NSH（在报文中插入 NSH 头，携带元数据与路径信息）",
      "NSH 方式中 NSH-Aware SF 能直接解析 NSH 头、无需解封装即可读到元数据，效率更高；NSH-Unaware SF 不认识 NSH 报文，需由 SFC Proxy 代其剥离封装",
      "二次还原：云平台已下发的业务在控制器上还原后，可用批量配置做二次编排；支持 VPC 互通二次还原与 MDC 跨 DC 业务编排",
      "AOC（开放可编程中心）以 YANG 模型为基础统一管理异构设备；OC 负责南向对接异构网络设备，Runbook 编排业务逻辑",
      "MDC 与公有云模型映射：LogicalRouter ↔ VPC 路由表，TGW 路由表 ↔ TransitRouter"
    ],
    tips: "业务链先分清\"引流方式\"（PBR 靠策略路由、NSH 靠报文头）再记角色（SF 干活、SFF 转发、SC 分类、SFC Proxy 代管不认识 NSH 的设备）"
  },
  {
    id: 'dcn-lossless',
    name: '无损网络（PFC/ECN/AIECN）',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "无损网络的目标：在以太网上做到\"不丢包\"，靠 PFC 反压 + ECN 拥塞标记配合实现，AI 训练与分布式存储必需",
      "PFC（基于优先级的流量控制，IEEE 802.1Qbb）：对指定优先级队列发反压帧（Pause），让上游暂停发送，避免交换机缓存溢出丢包",
      "PFC 死锁：反压沿环路逐级传导形成死循环，全网卡死。两种解法：死锁检测（检测到就恢复/隔离）、死锁预防（让设备不响应反压帧从而打断环路）",
      "ECN：利用 IP 头 TOS 字段末两位。00/01 表示支持 ECN 能力协商，11（CE，Congestion Experienced）表示路径上已发生拥塞",
      "DCQCN：交换机拥塞时给报文打 ECN 标记 → 接收端（RP）收到后回 CNP 拥塞通知报文 → 发送端（NP）据此降速。降速动作发生在发送端，不是交换机或接收端自己限速",
      "AIECN 面向 AI 流量做 ECN 增强；802.1Qcz 由华为主导，用于解决 PFC 头阻（HOL）问题"
    ],
    tips: "DCQCN 三句话记牢：交换机\"盖章\"（打 ECN）、接收端\"回信\"（CNP）、发送端\"减速\"。把降速说成交换机或接收端做的，一律错"
  },
  {
    id: 'dcn-ops',
    name: '数据中心智能运维',
    direction: 'dcn',
    parentId: 'dcn-basic',
    level: 3,
    keyPoints: [
      "Telemetry：设备主动、周期性推送数据到采集器，采样粒度可达亚秒级；相比 SNMP 轮询（分钟级、拉模式）实时性高得多，适合大规模网络的流量与性能监控",
      "网络健康度评估按层次划分：协议层（BGP 邻居、OSPF 邻居、M-LAG 组状态等控制面协议）、Overlay 层（VXLAN 隧道）、设备层与接口层",
      "网络快照：对设备配置与运行状态做基线留存与比对，分析范围覆盖 ARP 表项、路由协议状态、接口丢包计数等运行态数据；设备启动配置属于配置文件范畴，不在快照的运行态分析范围",
      "意图验证分控制面与数据面：控制面用仿真建模做事前推演（验证配置变更影响）；数据面基于真实转发表项、ARP 表项建模，验证全网连通性、路由黑洞与路由环路",
      "三级回滚：全网回滚（整网回到变更前）、业务回滚（单点业务恢复）、租户快照（按租户粒度备份与恢复）",
      "单路径探测：按五元组过滤，查看虚拟机之间具体业务流实际走过的物理路径，定位\"通但慢/丢包\"的路径级问题",
      "iMaster NCE-Fabric 负责控制与编排，FabricInsight 负责分析与洞察，SecoManager 负责安全设备管理（可与 Fabric 融合部署，属可选组件）"
    ],
    tips: "控制面\"事前仿真\"、数据面\"事后验证\"是意图验证的分水岭；健康度看协议层与 Overlay 层，快照看运行态，别把配置文件混进去"
  },
  // ===== 园区网架构与建设流程（2026-11-07 新增，承接「园区网规模/生命周期」类真题）=====
  {
    id: 'datacom-campus',
    name: '园区网架构与建设流程',
    direction: 'datacom',
    parentId: 'datacom',
    level: 3,
    keyPoints: [
      "园区网三层次：接入层（连终端、做端口密度与接入认证）、汇聚层（策略与路由汇聚、跨网段转发）、核心层（高速转发、不承担复杂策略）",
      "中小型园区常做两层扁平化：接入直连核心，省掉汇聚层，减少一跳转发与故障点；大型园区才做完整三层结构",
      "小型园区网络特征：网络层次简单、覆盖范围小、用户数量少、业务需求简单；反过来说「覆盖范围广」「用户数多」「层次复杂」都属于中大型园区",
      "网络生命周期四阶段：规划与设计 → 部署实施 → 运维监控 → 优化调整，循环迭代",
      "规划与设计是一个项目的开端，产出需求分析、逻辑拓扑、地址与路由规划、设备选型与可靠性方案，后续所有阶段都以它为基准",
      "实施照着设计落地，运维保证已上线业务稳定，优化基于运行数据做调优——三者都发生在项目启动之后"
    ],
    tips: "园区网先看规模再看层次：小园区扁平两层、大园区三层齐全；生命周期永远是「先画图纸再动工」，规划与设计打头"
  },
];
