# -*- coding: utf-8 -*-
"""
华为ICT大赛 网络赛道 题库 v7 扩充生成器（冲刺国家一等奖）
- 重点：补齐国赛 25% 的 WLAN 权重缺口 + 提升 IE 层深度 + 高命中（真题/高频）标注
- 输出：src/data/quizzes-extra-e.ts
- 全局去重：与已验证题库(quizzes*.ts)题干比对，重复的不写入
- 校验：knowledgeId 必须存在；答案必须在选项中
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

def load_knowledge_ids():
    ids = set()
    for f in KNOWLEDGE_FILES:
        with open(f, encoding='utf-8') as fh:
            for line in fh:
                m = re.search(r"id:\s*'([^']+)'", line)
                if m:
                    ids.add(m.group(1))
    return ids

def norm_text(s):
    """归一化题干：去空白与常见标点，忽略大小写，用于跨文件去重"""
    return re.sub(r"[\s，。、；：（）()\"'？?！!·\-—]", "", s).lower()

def load_existing_questions():
    """从已存在的题库文件中收集题干，用于全局去重（排除本生成目标 extra-e）"""
    texts = set()
    for f in glob.glob(os.path.join(REPO, 'src/data/quizzes*.ts')):
        if f.endswith('quizzes-extra-e.ts'):
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
    return 'datacom'

def add(type_, q, *args, tag=None):
    if type_ == 'judge':
        answer = args[0]
        exp = args[1]
        kid = args[2]
        diff = args[3] if len(args) > 3 and args[3] else 'IP'
        if len(args) > 4:
            tag = args[4]
        options = []
    else:
        options = args[0]
        answer = args[1]
        exp = args[2]
        kid = args[3]
        diff = args[4] if len(args) > 4 and args[4] else 'IP'
        if len(args) > 5:
            tag = args[5]
    Q.append(dict(type=type_, q=q, options=options, answer=answer, exp=exp,
                  kid=kid, diff=diff, tag=tag, direction=infer_direction(kid)))

# ======================================================================
# WLAN 方向（国赛 25%，最大缺口，IE 深度重点补齐）
# ======================================================================

# --- WLAN 标准与射频 ---
add('single', 'Wi-Fi 7 对应的 IEEE 标准是？', ['802.11be', '802.11ax', '802.11ac', '802.11ad'], '802.11be',
    'Wi-Fi 4=n、5=ac、6=ax、6E=ax(6GHz)、7=be；802.11be 引入 320MHz、4096-QAM 与多链路操作(MLO)。', 'wlan-standard', 'IE', 'hot')
add('single', '802.11be（Wi-Fi 7）相比 Wi-Fi 6 的关键增强不包括？', ['多链路操作 MLO', '320MHz 信道带宽', '4096-QAM', '引入 OFDMA'],
    '引入 OFDMA', 'OFDMA 是 Wi-Fi 6（802.11ax）引入的；Wi-Fi 7 在 OFDMA 基础上新增 MLO、320MHz、4096-QAM、Multi-RU 等。', 'wlan-standard', 'IE', 'hot')
add('single', 'Wi-Fi 6 的 1024-QAM 相比 Wi-Fi 5 的 256-QAM，单符号承载位数与速率提升约为？',
    ['10bit/符号，速率提升约 25%', '8bit/符号，速率提升约 10%', '12bit/符号，速率提升约 50%', '与 256-QAM 相同'],
    '10bit/符号，速率提升约 25%', '1024-QAM 每符号 10bit，256-QAM 为 8bit；同条件下速率提升约 25%，但需更好的信噪比。', 'wlan-wifi6', 'IE', 'real')
add('single', 'Wi-Fi 6 中 OFDMA 技术的核心作用是？', ['将信道划分为多个资源单元(RU)，多用户并行传输降低时延', '提升单用户峰值速率', '扩大覆盖范围', '加密用户数据'],
    '将信道划分为多个资源单元(RU)，多用户并行传输降低时延', 'OFDMA 把信道细分为 RU 分配给不同用户，实现多用户并行，显著改善多用户场景时延与效率。', 'wlan-wifi6', 'IE', 'hot')
add('single', '802.11ax 中 MU-MIMO 与 Wi-Fi 5 的差别是？', ['Wi-Fi 6 支持上下行 MU-MIMO', '仅支持下行', '仅支持上行', '不支持下行的 MIMO'],
    'Wi-Fi 6 支持上下行 MU-MIMO', 'Wi-Fi 5（ac）仅下行 MU-MIMO；Wi-Fi 6 支持上下行 MU-MIMO，并与 OFDMA 协同提升多用户吞吐。', 'wlan-wifi6', 'IE')
add('single', 'BSS Coloring（BSS 着色）技术的主要作用是？', ['为不同 BSS 打上颜色标识，减少同频干扰、提升空间复用', '标识加密方式', '标识信道带宽', '标识用户优先级'],
    '为不同 BSS 打上颜色标识，减少同频干扰、提升空间复用', '通过 BSS Color 区分本 BSS 与邻区，收到不同颜色的帧可提前判定为干扰并调整退避，提升密集部署下的空间复用。', 'wlan-wifi6', 'IE', 'hot')
add('single', 'TWT（Target Wake Time，目标唤醒时间）的主要作用是？', ['终端与 AP 协商唤醒时间，降低功耗延长电池寿命', '提升峰值速率', '扩大覆盖', '增加信道带宽'],
    '终端与 AP 协商唤醒时间，降低功耗延长电池寿命', 'TWT 让终端与 AP 约定唤醒/休眠周期，减少空口竞争与监听时间，是 IoT/低功耗场景的关键节能机制。', 'wlan-wifi6', 'IE')
add('single', '在中国，2.4GHz 频段可用的三个完全不重叠信道是？', ['1、6、11', '1、5、9', '1、6、11、14', '2、7、12'], '1、6、11',
    '2.4GHz 每信道 20MHz，1/6/11 互不重叠（信道中心频率间隔 25MHz）；14 信道仅日本可用。', 'wlan-standard', 'IP', 'real')
add('single', '在中国，5GHz 频段中属于 DFS（需避让雷达）的信道是？', ['52~64', '36~48', '149~165', '所有 5G 信道'],
    '52~64', '5G 中 52/56/60/64（以及 100~144）为 DFS 信道，需动态频率选择避让雷达；36~48、149~165 为非 DFS。', 'wlan-standard', 'IE', 'real')
add('single', '关于 dBm 与功率换算，下列正确的是？', ['0dBm=1mW，30dBm=1W', '0dBm=0mW', '20dBm=1W', '10dBm=100mW'],
    '0dBm=1mW，30dBm=1W', 'dBm 是以 1mW 为基准的对数单位：0dBm=1mW，10dBm=10mW，20dBm=100mW，30dBm=1000mW=1W。', 'wlan-rf', 'IE', 'hot')
add('single', 'AP 的 EIRP（等效全向辐射功率）等于？', ['发射功率 + 天线增益 - 馈线损耗', '发射功率 - 天线增益', '发射功率 × 天线增益', '仅等于发射功率'],
    '发射功率 + 天线增益 - 馈线损耗', 'EIRP 反映实际辐射能力：发射功率(dBm)+天线增益(dBi)-馈线/接头损耗(dB)，是覆盖规划与合规的关键指标。', 'wlan-rf', 'IE')
add('single', 'WLAN 中用于衡量天线增益的相对单位是？', ['dBi', 'dBm', 'dB', 'MHz'], 'dBi',
    'dBi 是相对点源天线的增益单位；dBm 是功率绝对值；dB 是相对比值。', 'wlan-rf', 'IE')
add('single', '覆盖规划中，衡量信号质量的常用最低门限（语音/数据业务）约为？', ['-65dBm', '0dBm', '-95dBm', '30dBm'],
    '-65dBm', '工程上通常要求目标区域信号强度优于 -65dBm 以保证速率与稳定性；边缘可放宽但会影响体验。', 'wlan-planning', 'IE', 'hot')
add('single', 'WLAN 中，2.4GHz 邻频干扰严重的主要原因是？', ['信道带宽 20MHz 而信道间隔仅 5MHz，信道相互重叠', '2.4G 没有 DFS', '2.4G 天线增益低', '2.4G 不支持 OFDM'],
    '信道带宽 20MHz 而信道间隔仅 5MHz，信道相互重叠', '2.4G 相邻信道中心频率间隔 5MHz，而信道宽 20MHz，导致大量重叠，故只能用 1/6/11 规划。', 'wlan-rf', 'IE', 'hot')

# --- WLAN 架构 / CAPWAP / STA 上线 ---
add('single', 'CAPWAP 协议中，控制隧道与数据隧道分别使用的端口是？', ['控制 UDP 5246、数据 UDP 5247', '控制 TCP 5246、数据 TCP 5247', '均使用 UDP 5246', '控制 UDP 5247、数据 UDP 5246'],
    '控制 UDP 5246、数据 UDP 5247', 'CAPWAP 控制隧道用 UDP 5246 承载配置/管理，数据隧道用 UDP 5247 承载用户数据（隧道转发模式）。', 'wlan-sta-online', 'IE', 'real')
add('single', 'FIT AP 上线流程的正确顺序是？', ['获取 IP → 发现 AC → CAPWAP 建链 → 版本同步 → 配置下发 → 上线', '发现 AC → 获取 IP → 上线 → 配置下发', '获取 IP → 上线 → 版本同步', 'CAPWAP 建链 → 获取 IP → 上线'],
    '获取 IP → 发现 AC → CAPWAP 建链 → 版本同步 → 配置下发 → 上线', 'AP 先通过 DHCP 获取 IP，再以静态/广播/DHCP Option43/DNS 发现 AC，建立 CAPWAP 隧道，同步版本后获取配置并上线。', 'wlan-sta-online', 'IE', 'hot')
add('single', 'AP 通过 DHCP 发现 AC 地址常用的 Option 是？', ['Option 43', 'Option 82', 'Option 60', 'Option 150'], 'Option 43',
    'Option 43 在 DHCP 应答中携带 AC 的 IP 列表供 AP 发现 AC（Option 82 用于中继信息）。', 'wlan-sta-online', 'IP', 'real')
add('single', 'AP 与 AC 跨三层组网时，AP 上线必须具备的条件是？', ['AP 与 AC 三层路由可达且能互通 CAPWAP 端口', '必须在同一广播域', '必须直连', '无需路由'],
    'AP 与 AC 三层路由可达且能互通 CAPWAP 端口', '三层组网下 AP 与 AC 在不同网段，需路由可达，且中间设备放行 CAPWAP 的 UDP 5246/5247。', 'wlan-arch', 'IE', 'hot')
add('single', '隧道转发与本地转发（直接转发）的核心区别是？', ['本地转发下用户数据由 AP 直接转发、不经 CAPWAP 数据隧道', '本地转发不经 AC 管理', '隧道转发不经 AC', '两者无区别'],
    '本地转发下用户数据由 AP 直接转发、不经 CAPWAP 数据隧道', '本地转发（直接转发）时业务数据在 AP 本地解封装后直接入网，减轻 AC 与汇聚压力；隧道转发则由 AC 集中处理。', 'wlan-arch', 'IE', 'hot')
add('single', '华为 AC 与 AP 之间的认证方式不包括？', ['WPA2-PSK 认证', 'MAC 认证', 'SN 序列号认证', '不认证'],
    'WPA2-PSK 认证', 'AP 上线认证有 MAC 认证/SN 认证/不认证三种；WPA2-PSK 是终端接入认证，不是 AP 认证。', 'wlan-arch', 'IE')
add('single', '旁挂组网与直连组网相比，主要优势是？', ['不改变现有网络结构，AC 旁挂于核心/汇聚，业务流量路径更灵活', '无需配置', 'AP 无需认证', '不需要 CAPWAP'],
    '不改变现有网络结构，AC 旁挂于核心/汇聚，业务流量路径更灵活', '直连组网 AC 串接在汇聚，改动大；旁挂组网 AC 旁挂在核心，业务转发可选择本地/隧道，部署更灵活。', 'wlan-arch', 'IE')
add('single', '一个射频上可创建的最大 VAP 数量通常为？', ['16', '4', '32', '1'], '16',
    '华为 AP 单个射频最多创建 16 个 VAP（SSID+射频+业务VLAN 的组合），VAP 是业务承载单元。', 'wlan-vap', 'IE', 'hot')
add('single', 'VAP（虚拟接入点）的组成要素包括？', ['射频 + SSID + 业务 VLAN', '仅 SSID', '仅射频', '仅 VLAN'],
    '射频 + SSID + 业务 VLAN', 'VAP 把射频、SSID、业务 VLAN/转发模式绑定，是 WLAN 业务配置的核心单元。', 'wlan-vap', 'IE')
add('single', '隐藏 SSID（不广播 Beacon 中的 SSID）的主要效果是？', ['终端无法通过扫描直接发现，需手工输入 SSID', '数据加密更强', '提升速率', '扩大覆盖'],
    '终端无法通过扫描直接发现，需手工输入 SSID', '隐藏 SSID 只是不广播，安全性有限（探测请求仍可暴露），不能替代加密。', 'wlan-vap', 'IP')

# --- WLAN 漫游 ---
add('single', '二层漫游与三层漫游的核心区别是？', ['二层漫游前后处于同一子网，三层漫游跨子网且需保持 IP 不变', '二层漫游更快但会改 IP', '三层漫游不需 AC', '两者都会修改 IP'],
    '二层漫游前后处于同一子网，三层漫游跨子网且需保持 IP 不变', '二层漫游在同一 VLAN/子网内切换 AP；三层漫游跨子网，由 AC 维护用户 IP 与隧道，保证业务不中断。', 'wlan-roaming', 'IE', 'hot')
add('single', '802.11r（快速漫游 FT）的作用是？', ['通过 PMK-R0/R1 预派生密钥，减少漫游时的重认证时延', '提升单用户速率', '加密管理帧', '动态选信道'],
    '通过 PMK-R0/R1 预派生密钥，减少漫游时的重认证时延', '802.11r 让终端与 AC 预建立密钥层次(PMK-R0/R1)，漫游时快速协商 PTK，显著缩短切换时延，适合 VoIP。', 'wlan-roaming', 'IE', 'hot')
add('single', '802.11k 为终端提供的核心能力是？', ['邻居报告（Neighbor Report），辅助终端快速发现可漫游的 AP', '加密管理帧', '节能唤醒', '提升带宽'],
    '邻居报告（Neighbor Report），辅助终端快速发现可漫游的 AP', '802.11k 让 AP 向终端提供候选邻居 AP 列表，减少终端全信道扫描，加快漫游决策。', 'wlan-roaming', 'IE')
add('single', '802.11v 在漫游中的作用是？', ['BSS 过渡管理，由网络侧引导终端切换到更合适的 AP', '加密数据帧', '提升 QAM', '动态频率选择'],
    'BSS 过渡管理，由网络侧引导终端切换到更合适的 AP', '802.11v 提供 BSS Transition Management，网络可主动建议终端漫游，配合 k/r 实现智能漫游。', 'wlan-roaming', 'IE')
add('single', 'AC 间漫游（漫游组）能够实现的前提是？', ['各 AC 加入同一漫游组并配置同步，用户信息可在 AC 间同步', 'AC 型号一致', '所有 AP 同一网段', '关闭加密'],
    '各 AC 加入同一漫游组并配置同步，用户信息可在 AC 间同步', '多台 AC 通过漫游组( Mobility Group )建立同步隧道，用户跨 AC 漫游时由主 AC 维护信息，实现无缝漫游。', 'wlan-roaming', 'IE')

# --- WLAN QoS ---
add('single', 'WMM（Wi-Fi 多媒体）基于 EDCA 划分的四个接入类别按优先级从高到低是？', ['VO(语音) > VI(视频) > BE(尽力而为) > BK(背景)', 'BK > BE > VI > VO', 'BE > VI > VO > BK', 'VI > VO > BE > BK'],
    'VO(语音) > VI(视频) > BE(尽力而为) > BK(背景)', 'WMM 将流量分 AC_VO/AC_VI/AC_BE/AC_BK 四类，分别对应不同 AIFSN/CW/TXOP，语音优先级最高。', 'wlan-qos', 'IE', 'hot')
add('single', 'WMM 中优先级最高、时延最敏感的接入类别是？', ['AC_VO', 'AC_VI', 'AC_BE', 'AC_BK'], 'AC_VO',
    'AC_VO 面向语音，采用最小竞争窗口与最短仲裁帧间隔(AIFSN)，优先抢占空口。', 'wlan-qos', 'IE')
add('single', 'WLAN QoS 中，空口调度困难的主要原因是？', ['无线介质共享且存在竞争，难以像有线一样精确整形', '无线带宽太大', '无线不需要 QoS', 'AP 性能不足'],
    '无线介质共享且存在竞争，难以像有线一样精确整形', '空口是共享媒质，需靠 EDCA 竞争与 AC 分类近似保障，无法像有线 PQ/WFQ 那样严格调度。', 'wlan-qos', 'IE')
add('judge', 'WLAN 中，提升发射功率一定能提升系统容量。', False,
    '加大功率会扩大覆盖但也加剧同频干扰与终端上行受限（AP 功率高于终端），反而可能降低容量；需综合信道/功率/密度规划。', 'wlan-qos', 'IE')

# --- WLAN 安全 ---
add('single', 'WPA3 相比 WPA2-PSK 的关键改进是？', ['采用 SAE（对等同时认证）替代 PSK，抗离线字典攻击', '取消加密', '仅支持企业认证', '降低密钥长度'],
    '采用 SAE（对等同时认证）替代 PSK，抗离线字典攻击', 'WPA3-Personal 用 SAE（Dragonfly 握手）实现前向保密，抵御离线字典攻击；WPA2-PSK 的四次握手易被离线破解。', 'wlan-security', 'IE', 'hot')
add('single', 'WPA2-Personal 与 WPA2-Enterprise 的核心区别是？', ['Personal 用预共享密钥(PSK)，Enterprise 用 802.1X/EAP 由 RADIUS 认证', 'Enterprise 不加密', 'Personal 更安全', '两者加密算法不同'],
    'Personal 用预共享密钥(PSK)，Enterprise 用 802.1X/EAP 由 RADIUS 认证', 'WPA2-Personal 使用 PSK 简单但密钥共享；Enterprise 通过 802.1X+EAP+RADIUS 实现每用户独立认证与密钥。', 'wlan-security', 'IE', 'real')
add('single', 'WPA/WPA2 四次握手（4-Way Handshake）的主要目的是？', ['协商并确认 PTK/GTK，实现密钥派生与双向确认', '分配 IP 地址', '选择信道', '提升速率'],
    '协商并确认 PTK/GTK，实现密钥派生与双向确认', '四次握手基于 PMK 与随机数(ANonce/SNonce)派生成对临时密钥 PTK 与组密钥 GTK，并确认双方密钥一致。', 'wlan-security', 'IE', 'hot')
add('single', '802.11w（PMF，管理帧保护）的作用是？', ['对管理帧进行完整性保护，防止伪造的去关联/解认证攻击', '加密数据帧', '提升速率', '隐藏 SSID'],
    '对管理帧进行完整性保护，防止伪造的去关联/解认证攻击', 'PMF 保护去关联/解认证等管理帧，抵御伪造管理帧的拒绝服务攻击；WPA3 强制启用。', 'wlan-security', 'IE')
add('single', 'WIDS/WIPS 在 WLAN 中的主要作用是？', ['检测/防御无线攻击与非法 AP，识别钓鱼、泛洪、欺骗等', '提升吞吐', '分配 IP', '漫游切换'],
    '检测/防御无线攻击与非法 AP，识别钓鱼、泛洪、欺骗等', 'WIDS 检测、WIPS 可主动反制：识别伪造 AP、泛洪攻击、暴力破解等无线侧威胁。', 'wlan-security', 'IE', 'hot')
add('single', 'WLAN 中"非法 AP"通常分类不包括？', ['合法邻居 AP', 'Rogue AP（私自接入）', '干扰 AP（钓鱼/仿冒）', 'Ad-hoc 终端'],
    '合法邻居 AP', '非法 AP 分类：Rogue（未授权私接）、干扰(Interfering，仿冒钓鱼)、邻居(Neighbor，合法但非本网)；邻居 AP 属正常存在。', 'wlan-security', 'IE')
add('judge', 'WLAN 中开启 SSID 隐藏即可等效于加密，能有效防止未授权接入。', False,
    '隐藏 SSID 仅不广播，攻击者仍可探测并接入；必须依赖 WPA2/WPA3 加密与 802.1X 准入才能真正防护。', 'wlan-security', 'IP')

# --- WLAN 规划与优化 ---
add('single', '高密场景（如体育馆、会议室）无线优化措施不包括？', ['增大 AP 发射功率至最大', '关闭低速率、限制低速率终端', '开启频段导航与负载均衡', '合理控制 AP 密度与功率'],
    '增大 AP 发射功率至最大', '高密场景应降低单 AP 功率、加密 AP 密度、关闭低速率、启用频段导航/负载均衡，而非一味加大功率（会加剧干扰）。', 'wlan-planning', 'IE', 'hot')
add('single', '频段导航（Band Steering）的作用是？', ['引导双频终端优先接入 5GHz，缓解 2.4GHz 拥塞', '加密 2.4G', '关闭 5G', '提升 2.4G 速率'],
    '引导双频终端优先接入 5GHz，缓解 2.4GHz 拥塞', '通过抑制 2.4G 探测响应等方式引导双频终端上 5G，平衡频段负载、提升体验。', 'wlan-planning', 'IE')
add('single', 'WLAN 容量规划主要考虑的因素不包括？', ['AP 的天线颜色', '并发用户数与单用户带宽需求', '单 AP 可承载的空间流/吞吐', '业务类型与信道资源'],
    'AP 的天线颜色', '容量规划关注并发数、单用户带宽、AP 吞吐能力、业务模型与信道资源；天线颜色非规划参数。', 'wlan-planning', 'IE')
add('single', 'WLAN 空口利用率居高不下，最不可能的原因是？', ['AP 供电电压过高', '同频干扰严重', '存在大量低速率终端', '接入用户数过多'],
    'AP 供电电压过高', '空口利用率高通常源于干扰、低速率终端长期占用、用户过密、非 Wi-Fi 干扰等；供电电压不影响空口利用率。', 'wlan-planning', 'IE', 'hot')
add('single', '无线网络勘测（Survey）通常分为哪两类？', ['预规划勘测与现场勘测', '上行与下行勘测', '2.4G 与 5G 勘测', '室内与室外勘测'],
    '预规划勘测与现场勘测', '预规划勘测用于估算 AP 数量与位置；现场勘测用于验证覆盖/干扰并优化，分为预测与实测阶段。', 'wlan-planning', 'IE')
add('single', 'WLAN 中，Beacon 帧的默认发送间隔是？', ['100ms（100 TU）', '1s', '10ms', '500ms'], '100ms（100 TU）',
    'Beacon Interval 默认 100 TU（1 TU=1024µs），AP 周期广播 SSID、支持速率等参数供终端发现。', 'wlan-standard', 'IE')
add('single', '802.11 帧类型中，用于关联、认证、Beacon 的是？', ['管理帧', '控制帧', '数据帧', '扩展帧'], '管理帧',
    '802.11 帧分管理帧（关联/认证/Beacon/探测）、控制帧（RTS/CTS/ACK）、数据帧（承载上层数据）。', 'wlan-standard', 'IP', 'real')
add('single', 'WLAN 中 RTS/CTS 机制的主要作用是？', ['解决隐蔽终端问题，通过预约信道减少冲突', '加密数据', '提升速率', '节能'],
    '解决隐蔽终端问题，通过预约信道减少冲突', 'RTS/CTS 通过短帧预约信道，使隐蔽终端获知信道占用，降低冲突（代价是额外开销）。', 'wlan-standard', 'IE', 'hot')
add('judge', '5GHz 频段相比 2.4GHz，通常信道更多、干扰更小、可用带宽更大。', True,
    '5G 信道资源丰富（多个非重叠 20/40/80/160MHz 信道）、干扰源少，适合高带宽业务；但穿墙能力弱于 2.4G。', 'wlan-standard', 'IP', 'hot')
add('single', 'WLAN 中，终端接入 AP 的正常流程是？', ['扫描 → 认证 → 关联 → （可选）802.1X/PSK 密钥协商 → 接入', '关联 → 扫描 → 认证', '认证 → 扫描 → 关联', '直接接入'],
    '扫描 → 认证 → 关联 → （可选）802.1X/PSK 密钥协商 → 接入', '终端先扫描发现 SSID，进行链路认证(开放/共享)、关联，再做安全认证与密钥协商后接入。', 'wlan-sta-online', 'IE', 'real')
add('single', 'AP 组（AP Group）在华为 WLAN 中的作用是？', ['对不同 AP 分组下发不同配置模板，实现差异化业务', '分配 IP', '加密数据', '选信道'],
    '对不同 AP 分组下发不同配置模板，实现差异化业务', 'AP 组将 AP 归类，可分别绑定 VAP/射频/安全模板，实现分区域差异化配置。', 'wlan-arch', 'IE')
add('single', 'WLAN 射频调优（RRM）自动完成的工作不包括？', ['修改终端 IP 地址', '自动信道分配', '发射功率调整', '干扰检测与规避'],
    '修改终端 IP 地址', 'RRM/射频调优负责信道、功率、干扰规避等自动化优化；终端 IP 由 DHCP 分配，与其无关。', 'wlan-rf', 'IE')
add('single', '关于 WLAN 中继（WDS/Mesh）组网，下列说法正确的是？', ['用于无线回传/扩展覆盖，AP 之间通过无线桥接', '提升终端速率', '替代 AC', '用于有线回传'],
    '用于无线回传/扩展覆盖，AP 之间通过无线桥接', 'WDS/Mesh 通过无线回传链路扩展覆盖或替代部分有线，适合布线困难场景，但会占用空口资源。', 'wlan-arch', 'IE')
add('single', 'WLAN 中，802.11a/b/g/n/ac/ax 中工作于 5GHz 且为 Wi-Fi 5 的是？', ['802.11ac', '802.11b', '802.11g', '802.11a'], '802.11ac',
    '802.11ac=Wi-Fi 5，工作在 5GHz；802.11a 同为 5G 但更早；b/g 为 2.4G；n 双频。', 'wlan-standard', 'IP')
add('single', 'WLAN 中影响覆盖范围的关键因素不包括？', ['终端的操作系统版本', '发射功率', '天线增益', '环境衰减与频段'],
    '终端的操作系统版本', '覆盖取决于功率、天线、频段、环境衰减与障碍物；OS 版本不影响射频覆盖。', 'wlan-rf', 'IE')
add('single', 'WLAN 中，采用 40MHz 带宽在 2.4GHz 频段的代价是？', ['可用非重叠信道减少，干扰概率上升', '速率下降', '覆盖变小', '无法使用'],
    '可用非重叠信道减少，干扰概率上升', '2.4G 用 40MHz 会占用两个 20MHz 信道，使本来只有 1/6/11 的非重叠规划更拥挤，干扰加剧，故高密场景建议锁定 20MHz。', 'wlan-planning', 'IE', 'hot')
add('single', 'WLAN 中 AC 的"隧道转发"模式下，用户数据流经路径是？', ['AP → CAPWAP 数据隧道 → AC → 上层网络', 'AP → 直接入网', 'AC → AP → 终端', '不经 AC'],
    'AP → CAPWAP 数据隧道 → AC → 上层网络', '隧道转发下 AP 将用户数据封装进 CAPWAP 数据隧道交给 AC，由 AC 解封装后转发，便于集中管控但增加 AC 压力。', 'wlan-arch', 'IE')
add('single', 'WLAN 中，一个 AP 的"射频"与"VAP"的关系是？', ['一个射频可承载多个 VAP，每个 VAP 对应一个 SSID', '一个射频只能一个 VAP', '一个 VAP 可跨多个射频', '二者无关'],
    '一个射频可承载多个 VAP，每个 VAP 对应一个 SSID', 'VAP 依附于射频，一个射频最多 16 个 VAP，实现同射频多 SSID 多业务。', 'wlan-vap', 'IE')
add('single', 'WLAN 中，"负载均衡"功能的作用是？', ['在多个 AP/频段间均衡终端数量，避免单 AP 过载', '提升单用户带宽', '加密数据', '扩展覆盖'],
    '在多个 AP/频段间均衡终端数量，避免单 AP 过载', '通过限制新用户接入过载 AP 或引导其接入空闲 AP，均衡 AP 间负载，提升整体体验。', 'wlan-planning', 'IE')
add('single', 'WLAN 中，AP 发现 AC 的方式不包括？', ['通过 BGP 邻居发现', '静态配置 AC 地址', 'DHCP Option 43', 'DNS 解析'], '通过 BGP 邻居发现',
    'AP 通过静态配置、二层广播、DHCP Option 43、DNS（huawei-ac.net 等）发现 AC；BGP 与 AP 发现无关。', 'wlan-sta-online', 'IE', 'hot')
add('single', 'WLAN 中，802.1X 认证体系的三要素是？', ['客户端(Supplicant)、认证设备(Authenticator)、认证服务器(Authentication Server)', 'AP、AC、交换机', 'SSID、VLAN、IP', '证书、密钥、密码'],
    '客户端(Supplicant)、认证设备(Authenticator)、认证服务器(Authentication Server)', '802.1X 三要素：终端客户端、认证设备(AP/交换机)、认证服务器(RADIUS)，AP 作为认证设备转发 EAP 报文。', 'wlan-security', 'IE', 'real')
add('single', 'WLAN 中，无线侧常见的攻击类型不包括？', ['ARP 表溢出（属有线侧二层攻击）', '钓鱼 AP（Evil Twin）', '去认证泛洪', '暴力破解 PSK'],
    'ARP 表溢出（属有线侧二层攻击）', '无线侧典型攻击：钓鱼 AP、去认证/解认证泛洪、暴力破解、泛洪等；ARP 表溢出是有线二层威胁。', 'wlan-security', 'IE')
add('single', 'WLAN 中，漫游时"漫游组"与"AC 间隧道"的作用是？', ['在 AC 间同步用户信息并在主备/多 AC 间转发用户数据', '加密终端数据', '分配 IP', '选信道'],
    '在 AC 间同步用户信息并在主备/多 AC 间转发用户数据', '漫游组使多台 AC 共享用户信息，AC 间隧道负责跨 AC 的用户数据转发，实现无缝漫游。', 'wlan-roaming', 'IE')
add('single', 'WLAN 中，"蜂窝式"部署优于"覆盖式"部署的主要原因是？', ['合理控制 AP 功率与密度，降低同频干扰、提升容量', '覆盖更大', '成本更低', '无需规划'],
    '合理控制 AP 功率与密度，降低同频干扰、提升容量', '蜂窝式部署通过较小功率、较多 AP 实现频率复用与容量提升，是高密场景的标准做法。', 'wlan-planning', 'IE', 'hot')
add('single', 'WLAN 中，Wi-Fi 6 在 5GHz 支持的最大单信道带宽是？', ['160MHz', '80MHz', '40MHz', '320MHz'], '160MHz',
    'Wi-Fi 6（ax）在 5G 最大支持 160MHz（可 80+80 非连续）；320MHz 是 Wi-Fi 7（802.11be）才引入（6GHz 为主）。', 'wlan-wifi6', 'IE')
add('single', 'WLAN 中，MU-MIMO 与 SU-MIMO 的区别是？', ['MU-MIMO 同时服务多个终端，SU-MIMO 一次只服务一个终端', 'SU 更快', 'MU 只用一根天线', '二者相同'],
    'MU-MIMO 同时服务多个终端，SU-MIMO 一次只服务一个终端', 'SU-MIMO 通过多天线服务单用户；MU-MIMO 利用空间复用同时服务多个用户，提升整体吞吐。', 'wlan-wifi6', 'IE')
add('single', 'WLAN 中，漫游判决主要由谁发起？', ['终端主导，网络(802.11k/v)可辅助引导', '完全由 AC 决定', '由 AP 强制', '由交换机决定'],
    '终端主导，网络(802.11k/v)可辅助引导', '传统漫游由终端根据信号决定；802.11k 提供邻居报告、802.11v 可引导，实现更优的智能漫游。', 'wlan-roaming', 'IE', 'hot')
add('single', 'WLAN 中，下列哪种加密最不安全，应避免使用？', ['WEP', 'WPA2-PSK', 'WPA2-Enterprise', 'WPA3-SAE'], 'WEP',
    'WEP 使用 RC4 且密钥固定，已被轻易破解；应使用 WPA2/WPA3。', 'wlan-security', 'IP', 'hot')
add('single', 'WLAN 中，"信道复用"（频率复用）的前提是？', ['通过空间隔离使同频 AP 互不干扰', '所有 AP 用同一信道', '关掉 5G', '降低带宽'],
    '通过空间隔离使同频 AP 互不干扰', '频率复用需保证同频 AP 空间上足够远（信号衰减到可接受），否则同频干扰，需结合功率与信道规划。', 'wlan-planning', 'IE')
add('judge', 'WLAN 中，CAPWAP 控制隧道即使采用本地转发模式也依然需要建立。', True,
    '无论隧道转发还是本地转发，AP 与 AC 之间都需要控制隧道承载配置/管理；本地转发只是不建数据隧道。', 'wlan-sta-online', 'IE', 'hot')
add('single', 'WLAN 中，AP 的供电方式不包括？', ['通过光纤供电', 'PoE 供电（802.3af/at/bt）', '本地电源适配器', 'PoE 注入器'],
    '通过光纤供电', 'AP 供电有 PoE（网线，802.3af/at/bt）、本地电源、PoE 注入器；光纤传数据但不供电。', 'wlan-arch', 'IP')
add('single', 'WLAN 中，为了提升漫游体验，通常要求漫游切换时延小于？', ['50ms', '500ms', '1s', '5s'], '50ms',
    '语音业务要求漫游切换时延尽量 <50ms，避免掉话；802.11r/k/v 与智能漫游即为降低时延。', 'wlan-roaming', 'IE')
add('single', 'WLAN 中，"频谱分析"功能主要用于？', ['识别非 Wi-Fi 干扰源（如微波炉、蓝牙、无线摄像头）', '分配 IP', '认证终端', '加密数据'],
    '识别非 Wi-Fi 干扰源（如微波炉、蓝牙、无线摄像头）', '频谱分析可发现非 Wi-Fi 干扰并定位，是排查空口质量问题的关键手段。', 'wlan-rf', 'IE', 'hot')

# ======================================================================
# 安全方向（国赛 25%，补 IE 深度）
# ======================================================================
add('single', 'IKEv2 相比 IKEv1 的主要改进不包括？', ['不再支持 NAT 穿越', '交换消息更少（初始 4 条）', '支持 EAP 认证', '更可靠的 SA 重协商'],
    '不再支持 NAT 穿越', 'IKEv2 消息更少、支持 EAP、原生支持 NAT-T 与 MOBIKE，重协商更稳健；IPSec 仍支持 NAT-T。', 'security-ipsec', 'IE', 'hot')
add('single', 'IPSec 中 DPD（死对端检测）的作用是？', ['周期性探测对端存活，及时感知隧道失效并切换', '加密数据', '分配地址', '提高带宽'],
    '周期性探测对端存活，及时感知隧道失效并切换', 'DPD 主动探测对端，避免黑洞路由导致业务中断，常用于双机/多链路备份场景。', 'security-ipsec', 'IE', 'hot')
add('single', '防火墙 ASPF（应用层状态过滤）的核心作用是？', ['对多通道应用进行应用层状态检测，动态放行协商出的通道', '仅过滤五元组', '加密流量', '限速'],
    '对多通道应用进行应用层状态检测，动态放行协商出的通道', 'ASPF 可识别 FTP/H.323/SIP 等多通道协议的协商信息，动态放开数据通道（Server-Map），弥补静态策略不足。', 'security-firewall-basic', 'IE', 'hot')
add('single', '防火墙安全策略与 ACL 的核心区别是？', ['安全策略可基于安全区域/应用/用户并做状态检测，ACL 仅匹配五元组', '二者完全相同', 'ACL 更安全', '安全策略不做匹配'],
    '安全策略可基于安全区域/应用/用户并做状态检测，ACL 仅匹配五元组', '下一代防火墙安全策略结合区域、应用、用户、内容等维度并带状态；ACL 仅报文头五元组匹配。', 'security-firewall-basic', 'IE', 'hot')
add('single', 'IPS 与 IDS 的核心区别是？', ['IPS 串联在线并可主动阻断，IDS 旁路侦测仅告警', 'IDS 可阻断', '二者都是旁路', 'IPS 只记录日志'],
    'IPS 串联在线并可主动阻断，IDS 旁路侦测仅告警', 'IPS 串联部署，检测到攻击可直接阻断；IDS 旁路镜像流量，仅告警不阻断。', 'security-ips-ids', 'IE', 'hot')
add('single', '等保 2.0 的"一个中心、三重防护"中的三重防护是指？', ['安全通信网络、安全区域边界、安全计算环境', '防火墙、IDS、VPN', '物理、网络、主机', '边界、终端、数据'],
    '安全通信网络、安全区域边界、安全计算环境', '等保 2.0 构建"安全管理中心"加"安全通信网络/安全区域边界/安全计算环境"三重防护体系。', 'security-management', 'IE', 'hot')
add('single', '零信任（Zero Trust）安全模型的核心原则是？', ['从不信任、始终验证，最小权限与持续评估', '内网绝对可信', '只信任 IP', '只做边界防护'],
    '从不信任、始终验证，最小权限与持续评估', '零信任摒弃"内网可信"假设，对所有访问持续认证与授权，贯彻最小权限与微分段。', 'security-management', 'IE', 'hot')
add('single', '东西向流量微隔离的主要目的是？', ['精细化隔离数据中心内部服务器间流量，防止横向移动', '加速南北向流量', '替代防火墙', '加密磁盘'],
    '精细化隔离数据中心内部服务器间流量，防止横向移动', '微隔离按业务/角色细分东西向访问控制，遏制攻击者横向移动，是零信任在数据中心的落地。', 'security-fw-advance', 'IE', 'hot')
add('single', '防火墙双机热备中，HRP 同步的内容不包括？', ['终端用户的 IP 地址池分配记录', '会话表', '配置与策略', '证书与密钥'],
    '终端用户的 IP 地址池分配记录', 'HRP 在防火墙间同步会话表、配置、证书等，保证主备切换业务不中断；终端地址由 DHCP，不属 HRP 同步。', 'security-ha', 'IE', 'hot')
add('single', 'SSL VPN 的三种接入方式不包括？', ['IPSec 站点到站点', 'Web 接入（无客户端）', '网络扩展（全隧道）', '端口转发'],
    'IPSec 站点到站点', 'SSL VPN 接入方式：Web（无客户端）、网络扩展（需客户端，全网络访问）、端口转发；站点到站点属 IPSec VPN。', 'security-ssl-vpn', 'IE', 'real')
add('single', '防火墙"安全策略"默认动作通常是？', ['拒绝（Deny）', '允许', '丢弃但不记录', '随机'],
    '拒绝（Deny）', '华为防火墙安全策略默认动作通常为 deny，未匹配任何策略的流量被拒绝，符合最小授权原则。', 'security-firewall-basic', 'IE', 'hot')
add('single', 'IPSec 中，IKE 的作用是？', ['协商并建立 IPSec SA（密钥与参数）', '加密所有流量', '分配 IP', '做 NAT'],
    '协商并建立 IPSec SA（密钥与参数）', 'IKE 负责身份认证、密钥协商与 SA 建立维护；IPSec 用协商出的 SA 对数据加密与验证。', 'security-ipsec', 'IE', 'hot')
add('single', '下列哪种技术用于防止 DHCP 私接与 IP 欺骗？', ['DHCP Snooping + IPSG', 'SSL VPN', 'WPA3', 'STP'],
    'DHCP Snooping + IPSG', 'DHCP Snooping 建立合法绑定表并过滤非法 DHCP；IPSG 基于绑定表校验源 IP/MAC，二者配合防私接与欺骗。', 'security-dhcp-snooping', 'IE', 'hot')
add('single', '802.1X 认证中，认证设备（Authenticator）通常是？', ['交换机或 AP', '终端', 'RADIUS 服务器', '防火墙'],
    '交换机或 AP', '802.1X 三要素：Supplicant(终端)、Authenticator(交换机/AP)、Authentication Server(RADIUS)。', 'security-8021x', 'IE', 'real')
add('single', 'Portal 认证相比 802.1X 的主要优势是？', ['终端无需安装客户端，浏览器即可认证', '加密更强', '必须配合证书', '仅支持有线'],
    '终端无需安装客户端，浏览器即可认证', 'Portal（Web）认证免客户端，适合访客与哑终端；802.1X 通常需客户端或系统 EAP 支持。', 'security-portal', 'IE', 'hot')
add('single', '防火墙 Vsys（虚拟系统）与 VRF 的核心区别是？', ['Vsys 提供含安全策略/会话的完整逻辑防火墙，VRF 仅隔离路由表', '二者相同', 'VRF 更安全', 'Vsys 只隔离路由'],
    'Vsys 提供含安全策略/会话的完整逻辑防火墙，VRF 仅隔离路由表', 'Vsys 是防火墙虚拟化，含策略/会话/资源隔离；VRF 是路由器上的路由表隔离，不涉安全策略。', 'security-fw-advance', 'IE', 'hot')
add('single', 'WAF 主要防护的攻击类型是？', ['SQL 注入、XSS 等 Web 应用层攻击', 'SYN Flood', 'ARP 欺骗', '暴力破解 SSH'],
    'SQL 注入、XSS 等 Web 应用层攻击', 'WAF 针对 HTTP/HTTPS 应用层攻击（注入、XSS、文件包含等），与网络层 DDoS 防护互补。', 'security-antivirus', 'IE')
add('single', '数字签名主要用于保证？', ['完整性、身份认证与不可否认性', '机密性', '可用性', '带宽'],
    '完整性、身份认证与不可否认性', '数字签名用私钥签名、公钥验证，保证完整性与不可否认；机密性由加密保证。', 'security-pki', 'IE', 'real')
add('single', 'IPSec 隧道模式与传输模式的区别是？', ['隧道模式封装整个原始 IP 包并新增外层 IP 头，传输模式保留原 IP 头', '传输模式更安全', '隧道模式不加密', '二者相同'],
    '隧道模式封装整个原始 IP 包并新增外层 IP 头，传输模式保留原 IP 头', '隧道模式用于网关到网关，隐藏内网地址；传输模式用于端到端，仅保护载荷，开销更小。', 'security-ipsec', 'IE', 'hot')

# ======================================================================
# 数通方向（国赛 50%，补 HCIE 深水区）
# ======================================================================
add('single', 'MSTP 中，多实例（MSTI）的核心价值是？', ['让不同 VLAN 走不同转发路径，实现负载分担与冗余', '减少 VLAN 数量', '替代 STP', '加快收敛'],
    '让不同 VLAN 走不同转发路径，实现负载分担与冗余', 'MSTP 把多个 VLAN 映射到不同实例(MSTI)，各实例独立计算生成树，实现流量负载分担。', 'datacom-mstp', 'IE', 'hot')
add('single', 'MSTP 域（MST Region）的判定依据是？', ['域名、修订级别、VLAN 映射三者完全一致', '仅域名', '仅 VLAN 映射', '桥优先级'],
    '域名、修订级别、VLAN 映射三者完全一致', '同一 MST 域要求域名、修订级别(Revision Level)、VLAN 到实例的映射三者完全一致，否则视为不同域。', 'datacom-mstp', 'IE', 'hot')
add('single', 'BGP 联盟（Confederation）的主要作用是？', ['将一个大 AS 划分为多个子 AS，减少 IBGP 全互联数量', '替代 RR', '加密路由', '加快收敛'],
    '将一个大 AS 划分为多个子 AS，减少 IBGP 全互联数量', '联盟通过子 AS( Confederation )降低 IBGP 全互联规模；跨子 AS 用联盟 EBGP，对外仍呈现为单一 AS。', 'datacom-bgp', 'IE')
add('single', 'BGP 路由反射器的防环机制依赖哪些属性？', ['Originator_ID 与 Cluster_List', 'AS_Path 与 MED', 'Local_Pref 与 Weight', 'Community 与 Origin'],
    'Originator_ID 与 Cluster_List', 'RR 反射路由时添加 Originator_ID（原始通告者）与 Cluster_List（经过的簇 ID），防止反射环路。', 'datacom-bgp', 'IE', 'hot')
add('single', 'OSPF 中，Type-3 LSA（Network Summary）由谁产生？', ['ABR', 'ASBR', 'DR', '任意路由器'],
    'ABR', 'Type-3 由 ABR 产生，描述区域间路由（其他区域的网段），用于区域间路由计算。', 'datacom-ospf', 'IE', 'hot')
add('single', 'OSPF 中，NSSA 区域内引入的外部路由以哪种 LSA 承载？', ['Type-7', 'Type-5', 'Type-3', 'Type-4'], 'Type-7',
    'NSSA 中 ASBR 引入外部路由用 Type-7 承载，由 ABR 转换为 Type-5 通告到其他区域。', 'datacom-ospf', 'IE', 'hot')
add('single', 'MPLS L3VPN 跨域 Option A 的特点是？', ['ASBR 之间为背靠背 VRF，逐域配置 VPN 实例', 'ASBR 间交换带标签的 VPN 路由', '使用 RR 交换 VPNv4 路由', '无需 VRF'],
    'ASBR 之间为背靠背 VRF，逐域配置 VPN 实例', 'Option A：ASBR 间把 VPN 当作普通 VRF 对接（背靠背），配置量大但简单；Option B 交换带标签的 VPNv4；Option C 用 RR 多跳。', 'datacom-mpls-vpn', 'IE', 'hot')
add('single', 'MPLS 转发时，决定下一跳的核心依据是？', ['外层标签（栈顶标签）', '内层标签', '目的 IP', 'MAC 地址'],
    '外层标签（栈顶标签）', 'MPLS 逐跳根据栈顶标签查找 LFIB 转发；内层标签由出口 PE 用于区分 VPN。', 'datacom-mpls-basic', 'IE', 'hot')
add('single', '策略路由（PBR）相比传统路由的核心优势是？', ['可基于源地址/协议等策略引流，不受目的地址路由表限制', '收敛更快', '更省带宽', '自动加密'],
    '可基于源地址/协议等策略引流，不受目的地址路由表限制', 'PBR 按策略（源/协议/端口等）指定下一跳，实现按需引流与分流，打破仅按目的地址转发的限制。', 'datacom-policy-route', 'IE', 'hot')
add('single', 'NQA（网络质量分析）主要用于？', ['检测链路时延、丢包、抖动等质量指标，联动做链路切换', '分配 IP', '加密数据', '计算路由'],
    '检测链路时延、丢包、抖动等质量指标，联动做链路切换', 'NQA 通过探测报文测量链路质量，可与智能选路/备份联动，实现基于质量的主备切换。', 'datacom-nms', 'IE', 'hot')
add('single', 'IPv6 过渡技术中，能让 IPv4 与 IPv6 主机互访的是？', ['NAT64/DNS64', '双栈', 'GRE 隧道', '仅手动隧道'],
    'NAT64/DNS64', '双栈让设备同时支持两协议便于共存；隧道承载 IPv6 over IPv4；NAT64/DNS64 实现 IPv6 主机访问 IPv4 资源（协议转换）。', 'datacom-ipv6-basic', 'IE', 'hot')
add('single', 'BGP 选路中，在比较 AS_Path 长度之前，华为设备优先比较的属性（本地优先）是？', ['Preferred-Value', 'MED', 'Origin', 'Next_Hop'],
    'Preferred-Value', '华为 BGP 选路：Preferred-Value(华为私有，本地) > Local_Pref > 本地始发 > AS_Path > Origin > MED；Preferred-Value 最先比较。', 'datacom-bgp', 'IE', 'hot')

# ============================ 校验与输出 ============================
def ts_escape(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

def validate():
    for q in Q:
        if q['kid'] not in KNOWN:
            print('[WARN] 未知 knowledgeId:', q['kid'], '|', q['q'][:30])
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
    lines = ["// 自动生成：华为ICT大赛网络赛道题库 v7 扩充（冲刺国家一等奖，补 WLAN/安全/数通 IE 深度）",
             "// 由 scripts/gen_questions_v7.py 离线生成，请勿手工编辑",
             "import type { IQuizQuestion } from './quizzes'",
             "",
             "export const EXTRA_QUIZZES_E: IQuizQuestion[] = ["]
    for q in uniq:
        counters[q['direction']] += 1
        nid = f"nx7-{dir_code[q['direction']]}-{counters[q['direction']]:03d}"
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
    emit(os.path.join(REPO, 'src/data/quizzes-extra-e.ts'))
