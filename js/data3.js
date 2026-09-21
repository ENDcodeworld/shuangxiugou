/* ============================================================
 * 双休购 v3 · 增强数据层
 * ① SUB_IMG        细分类 → 真实产品配图（本地 img/products/）
 * ② PRICE_RANGE   各分类价格区间（用于确定性定价）
 * ③ BLACKLIST_EXTRA 劳动争议记录（已清空，仅保留 data2.js 中的法律文书案例）
 * ④ JOBS          双休企业在招岗位（应聘入口）
 * ⑤ 商品富化函数  enrichProduct：价格/划线价/销量/评分/评论数
 * 数据整理时间：2026-09-20
 * ============================================================ */

/* ---------- 细分类 → 产品图 ---------- */
const SUB_IMG = {
  '手机': 'img/products/phone.jpg', '电脑平板': 'img/products/laptop.jpg', '无人机': 'img/products/camera.jpg',
  '影像设备': 'img/products/camera.jpg', '耳机音箱': 'img/products/headphones.jpg', '智能穿戴': 'img/products/watch.jpg',
  '游戏设备': 'img/products/game.jpg', '储能电源': 'img/products/evcharge.jpg',
  '空调': 'img/products/tv.jpg', '冰箱洗衣机': 'img/products/tv.jpg', '厨房电器': 'img/products/bread.jpg',
  '清洁电器': 'img/products/drill.jpg', '环境电器': 'img/products/plant.jpg', '电视影音': 'img/products/tv.jpg',
  '社交': 'img/products/network.jpg', '办公协作': 'img/products/office.jpg', '视频影音': 'img/products/tv.jpg',
  '工具': 'img/products/keyboard.jpg', '阅读资讯': 'img/products/book.jpg', '设计创意': 'img/products/art.jpg',
  'AI应用': 'img/products/chip.jpg', '操作系统': 'img/products/laptop.jpg',
  '运动鞋': 'img/products/sneaker.jpg', '运动服饰': 'img/products/running.jpg', '休闲服饰': 'img/products/tshirt.jpg',
  '女装': 'img/products/dress.jpg', '女鞋': 'img/products/shoes.jpg', '潮牌': 'img/products/tshirt.jpg',
  '洗护发': 'img/products/skincare.jpg', '护肤': 'img/products/skincare.jpg', '高端护肤': 'img/products/perfume.jpg',
  '彩妆香水': 'img/products/lipstick.jpg', '个护清洁': 'img/products/medicine.jpg', '男士护理': 'img/products/glasses.jpg',
  '纸品家清': 'img/products/food.jpg',
  '生鲜': 'img/products/fruit.jpg', '乳品饮料': 'img/products/milk.jpg', '零食': 'img/products/food.jpg',
  '粮油调味': 'img/products/oil.jpg', '营养保健': 'img/products/medicine.jpg', '农产品': 'img/products/vegetable.jpg',
  '纸尿裤': 'img/products/baby.jpg', '奶粉辅食': 'img/products/milk.jpg', '婴童用品': 'img/products/baby.jpg',
  '五金工具': 'img/products/drill.jpg', '开关电气': 'img/products/evcharge.jpg', '家具家居': 'img/products/couch.jpg',
  '照明': 'img/products/lamp.jpg',
  '整车': 'img/products/car.jpg', '汽车配件': 'img/products/engine.jpg', '充电补能': 'img/products/evcharge.jpg',
  '教育图书': 'img/products/bookstore.jpg', '大众图书': 'img/products/book.jpg', '文创': 'img/products/art.jpg',
  '手游': 'img/products/game.jpg', '主机游戏': 'img/products/game.jpg', '电竞': 'img/products/keyboard.jpg',
  '潮流玩具': 'img/products/lego.jpg',
  '直播电商': 'img/products/shopping.jpg', '平台服务': 'img/products/shopping.jpg', '跨境好物': 'img/products/delivery.jpg',
  '升学规划': 'img/products/graduation.jpg', '职业培训': 'img/products/teacher.jpg', '研学营地': 'img/products/graduation.jpg',
  '语言培训': 'img/products/language.jpg',
  '机酒预订': 'img/products/hotel.jpg', '旅游度假': 'img/products/flight.jpg', '门票玩乐': 'img/products/beach.jpg',
  '出行打车': 'img/products/car.jpg', '快递物流': 'img/products/delivery.jpg',
  '投资孵化': 'img/products/handshake.jpg', '营销服务': 'img/products/megaphone.jpg', '技术服务': 'img/products/network.jpg',
  '咨询服务': 'img/products/handshake.jpg', '制造代工': 'img/products/robot.jpg', '云计算': 'img/products/network.jpg',
  '硬件设备': 'img/products/chip.jpg', '医药健康': 'img/products/pharma.jpg'
};

/* ---------- 各分类价格区间 ---------- */
const PRICE_RANGE = {
  '数码电子': [299, 8999], '家用电器': [199, 9999], '软件应用': [15, 899],
  '服饰运动': [49, 1599], '个护美妆': [19, 1299], '食品生鲜': [9, 299],
  '母婴亲子': [29, 699], '家居家装': [29, 2999], '汽车出行': [199, 299999],
  '图书文娱': [19, 199], '游戏娱乐': [29, 2999], '电商消费': [29, 1999],
  '教育服务': [99, 9999], '本地服务': [9, 4999], '企业服务': [199, 99999]
};

/* 确定性散列：同一商品每次算出同样的价格/销量/评分 */
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; }
  return Math.abs(h);
}
/* 取整到「99/199/259」这类好看价位 */
function nicePrice(v) {
  if (v < 50) return Math.round(v / 9) * 9 + 9;
  if (v < 500) return Math.round(v / 49) * 49 + 49;
  if (v < 2000) return Math.round(v / 99) * 99 + 99;
  if (v < 10000) return Math.round(v / 199) * 199 + 199;
  return Math.round(v / 999) * 999 + 999;
}
/* ---------- 商品名关键词 → 精准配图 ---------- */
const KEYWORD_IMG = [
  // 使用 Unsplash 真实产品照片
  ['咖啡|coffee|胶囊|雀巢', 'https://img.alicdn.com/bao/uploaded/i1/3336823365/O1CN01ez0NR81ajDSgXHVFU_!!2-item_pic.png'],
  ['手机|phone|Galaxy|iPhone|小米|华为|苹果|REDMI', 'https://doc-fd.zol-img.com.cn/t_s640x2000/g7/M00/0A/05/ChMkK2WmVFKIQMIKAAEPYty-jR8AAZqfQGhi54AAQ96035.jpg'],
  ['耳机|headphone|降噪|WH-1000|Mic', 'https://picx.zhimg.com/50/v2-0574d2e5e372802f8780ee64c91f955a_720w.jpg?source=1def8aca'],
  ['手表|watch|手环|穿戴', 'https://static.leiphone.com/uploads/new/article/pic/202309/65043363ce137.jpg'],
  ['相机|微单|Alpha|镜头|单反|无人机|DJI|大疆', 'https://doc-fd.zol-img.com.cn/t_s640x2000/g7/M00/09/00/ChMkK2T356qIDES4AAVfUiOfSjUAAUiggHo3mUABV9q602.jpg'],
  ['电脑|笔记本|laptop|Surface|平板|tablet|Xbox', 'https://qnam.smzdm.com/202503/12/67d1407d89c459734.jpg_e1080.jpg'],
  ['电视|TV|QLED|影音|投影', 'https://microled.cn/uploadfile/ueditor/image/202510/17597535577d89a5.png'],
  ['键盘|keyboard|机械', 'https://img.pconline.com.cn/images/upload/upc/tx/onlinephotolib/1907/12/c1/158781284_1562912779404.jpg'],
  ['鼠标|mouse', 'https://images.unsplash.com/photo-1527814050087-3793815f47b9?w=600&q=80'],
  ['冰箱|洗衣机|家电|空调|美的|海尔|西门子', 'http://cdn02.ehaier.com/product/56d52950983d794b3d8b4625_1200_1200.jpg'],
  ['洗碗机|厨房|电饭煲|微波炉|扫地', 'https://assets.puxiang.com/uploads/photo/image/3144809/ea9ecee3b4fa16a6e05edcd93a4dc5ec.jpg-photo_sp'],
  ['跑鞋|sneaker|跑步|运动|瑜伽', 'https://gd-hbimg.huaban.com/1e50bbb8a73b8bd556c2caa65bad3e2aa6dd6f3b284701-Zt5XOj_fw658'],
  ['连衣裙|女装|dress|裙子|女装', 'https://images.unsplash.com/photo-1595777457583-95e059d51b9a?w=600&q=80'],
  ['T恤|tshirt|UT|摇粒绒|轻羽绒|服饰', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
  ['鞋|shoe|靴|凉鞋', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=600&q=80'],
  ['护肤|skincare|精华|面霜|水乳|防晒|洁面|SK-II|海飞丝', 'https://gd-hbimg.huaban.com/855fa1b8523f52fe16805e2eebfecdc2b38fadae59a3b-dk0vPX_fw658'],
  ['口红|lipstick|彩妆|MAC|唇|粉底', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&q=80'],
  ['香水|perfume|香氛', 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80'],
  ['水果|fruit|生鲜|苹果|橙|草莓|葡萄|农产品', 'https://images.unsplash.com/photo-1610832958506-aae17ac6b37e?w=600&q=80'],
  ['牛奶|奶粉|乳|酸奶|饮料|咖啡', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80'],
  ['零食|巧克力|饼干|糖|薯片|面包', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&q=80'],
  ['药|维生素|保健|洗护|洗发|洗衣', 'http://img.365diandao.com/Storage/Shop/649/Products/11000/1.png'],
  ['婴儿|纸尿裤|宝宝|母婴', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80'],
  ['车|car|汽车|SUV|轿车|SU7|整车', 'https://img.pcauto.com.cn/images/upload/upc/tx/auto5/2410/31/c6/460149190_1730358944325.jpg'],
  ['充电|储能|电源|换电|电池', 'https://images.unsplash.com/photo-1609592424896-ab9acdcf517c?w=600&q=80'],
  ['书|book|阅读|小说|教材|文具', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80'],
  ['乐高|lego|积木|玩具|toy|拼图', 'https://am.zdmimg.com/201602/01/56af1a3c12677.jpg_e1080.jpg'],
  ['游戏|game|手游|PS5|Steam|主机|电竞', 'https://am.zdmimg.com/202505/07/681aa27acb774395.jpg_e1080.jpg'],
  ['酒店|hotel|民宿|住宿|旅游|旅行', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80'],
  ['飞机|flight|机票|航空|出差', 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80'],
  ['办公|office|协作|会议|打印', 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80'],
  ['芯片|chip|半导体|处理器|GPU|CPU|固态', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80'],
  ['投资|孵化|咨询|猎头|招聘', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80'],
  ['营销|广告|推广|品牌', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'],
  ['机器人|robot|自动化|机械臂|工业', 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80'],
  ['网络|network|云|AWS|Azure|SAP|Oracle|数据库|服务器|SaaS|云计算', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80'],
  ['教育|培训|课程|学校|升学|考研', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80'],
  ['花|flower|玫瑰|花艺|绿植|盆栽', 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&q=80'],
  ['工具|drill|五金|电钻|博世', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80'],
  ['家具|沙发|家居|收纳', 'https://img.alicdn.com/bao/uploaded/i3/2207239419714/O1CN017mGPmi2Ld4KmLw1Fj_!!2207239419714.jpg'],
  ['快递|delivery|物流|配送|仓储', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80'],
  ['直播|平台|跨境|特卖|旗舰|电商', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80'],
];
/* 富化单个商品：返回价格/划线价/销量/评分/评论数/图 */
function enrichProduct(p) {
  const h = hashStr(p.name + '|' + (p.cid || ''));
  // 支持显式定价（真实市场价）
  let price;
  if (p.price) { price = p.price; }
  else {
    const range = PRICE_RANGE[p.cat] || [29, 999];
    const base = range[0] + (h % (range[1] - range[0]));
    price = Math.max(9, nicePrice(base));
  }
  const orig = p.origPrice || Math.round(price * (1.18 + (h % 50) / 10) * 10) / 10;
  const sales = 300 + (h % 49700);
  const rating = (4.3 + (h % 70) / 100).toFixed(1);
  const reviews = 80 + (h % 4920);
  // 支持显式图片URL
  let img;
  if (p.img) { img = p.img; }
  else {
    img = '';
    const name = (p.name || '') + ' ' + (p.desc || '');
    for (const [kw, file] of KEYWORD_IMG) {
      if (new RegExp(kw).test(name)) {
        img = file.startsWith('http') ? file : ('img/products/' + file);
        break;
      }
    }
    if (!img) {
      img = SUB_IMG[p.sub] || SUB_IMG[p.cat] || 'img/products/shopping.jpg';
    }
  }
  const q = encodeURIComponent(p.name || '');
  const buyUrl = p.buyUrl || ('https://search.jd.com/Search?keyword=' + q);
  return { price, origPrice: orig > price ? Math.round(orig) : Math.round(price * 1.3), sales, rating, reviews, img, buyUrl };
}

/* ---------- 劳动争议记录（已清空，仅保留 data2.js 中的法律文书案例） ---------- */
const BLACKLIST_EXTRA = [];

/* ---------- 双休企业在招岗位（应聘） ---------- */
/* 岗位为示例性质，真实职位以官方招聘页实时为准 */
const JOBS = {
  'leshi': [
    { title: '高级 Android 工程师', salary: '25-45K·14薪', loc: '北京', tags: ['双休', '不打卡', '无996'] },
    { title: '内容运营经理', salary: '18-30K', loc: '北京', tags: ['四天半', '弹性'] }
  ],
  'microsoft': [
    { title: 'Software Engineer 2', salary: '35-60K·16薪', loc: '北京/苏州', tags: ['955', '15天年假', 'WFH'] },
    { title: '产品经理 (PMM)', salary: '30-50K', loc: '上海', tags: ['WLB', '补充医疗'] }
  ],
  'siemens': [
    { title: '电气设计工程师', salary: '18-30K·13薪', loc: '上海', tags: ['双休天花板', '2天WFH', '顶格公积金'] },
    { title: '供应链专员', salary: '12-20K', loc: '西安', tags: ['圣诞假', '班车'] }
  ],
  'dji': [
    { title: '嵌入式固件工程师', salary: '25-45K·14薪', loc: '深圳', tags: ['双休', '21点强制下班', 'GT币'] },
    { title: '影像算法工程师', salary: '35-60K', loc: '深圳', tags: ['双休', '不加班'] }
  ],
  'midea': [
    { title: '结构工程师', salary: '15-25K', loc: '佛山', tags: ['18:20下班', '六条禁令'] },
    { title: '电商运营', salary: '12-22K', loc: '佛山', tags: ['双休', '少开会'] }
  ],
  'bytedance': [
    { title: '后端开发工程师', salary: '30-60K·15薪', loc: '北京', tags: ['双休', '取消大小周', '三餐'] },
    { title: '产品经理', salary: '25-50K', loc: '北京/上海', tags: ['双休', '加班需审批'] }
  ],
  'tencent': [
    { title: '后台开发工程师', salary: '28-55K·16薪', loc: '深圳', tags: ['双休', '安居计划', '弹性'] },
    { title: '游戏策划', salary: '25-45K', loc: '深圳', tags: ['双休', '健康日'] }
  ],
  'xiaomi': [
    { title: '手机系统工程师', salary: '22-40K', loc: '北京', tags: ['双休', '内购福利', '补休'] },
    { title: '市场经理', salary: '18-30K', loc: '北京', tags: ['双休', '早9晚6'] }
  ],
  'ctrip': [
    { title: '前端开发工程师', salary: '20-40K·14薪', loc: '上海', tags: ['3+2混合办公', '生育补贴'] },
    { title: '酒店产品经理', salary: '18-32K', loc: '上海', tags: ['双休', '免审批WFH'] }
  ],
  'dewu': [
    { title: '鉴别师（球鞋）', salary: '10-18K', loc: '上海', tags: ['双休', '弹性通勤假'] },
    { title: '电商风控工程师', salary: '20-35K', loc: '上海', tags: ['双休', '每月5次弹性假'] }
  ],
  'mihoyo': [
    { title: '游戏客户端工程师', salary: '35-70K·16薪', loc: '上海', tags: ['双休', '不卷', '年度旅游'] },
    { title: '原画师', salary: '25-50K', loc: '上海', tags: ['双休', '不打卡'] }
  ],
  'lilith': [
    { title: '游戏服务器工程师', salary: '30-55K', loc: '上海', tags: ['双休', '不打卡', '补充公积金'] }
  ],
  'pg': [
    { title: '管理培训生 (MT)', salary: '25-40K·14薪', loc: '广州', tags: ['朝九晚六', '18天年假'] },
    { title: '品牌经理', salary: '20-35K', loc: '广州', tags: ['双休', '弹性福利'] }
  ],
  'apple': [
    { title: 'Acoustic Engineer', salary: '30-60K·16薪', loc: '上海', tags: ['不打卡', 'RSU', '内购'] },
    { title: '零售专家 (RSS)', salary: '12-20K', loc: '全国', tags: ['排班制', '补充医疗'] }
  ],
  'nvidia': [
    { title: 'CUDA 架构工程师', salary: '45-80K·16薪', loc: '北京/上海', tags: ['顶薪', '季度假', 'RSU'] }
  ],
  'nestle': [
    { title: '食品研发工程师', salary: '15-25K·13薪', loc: '北京', tags: ['双休', '外企福利'] }
  ],
  'loreal': [
    { title: '彩妆产品经理', salary: '18-32K', loc: '上海', tags: ['双休', '弹性', '内购'] }
  ],
  'ikea': [
    { title: '全屋设计师', salary: '10-18K', loc: '上海', tags: ['办公室双休', '员工餐', '门店排班'] }
  ],
  'decathlon': [
    { title: '运动产品经理', salary: '12-22K', loc: '上海', tags: ['双休', '运动津贴', '员工折扣'] }
  ],
  'microsoft_careers': []
};
/* 其他公司：默认生成「去官方招聘页投递」的提示岗位 */
function getJobs(cid) { return JOBS[cid] || []; }
