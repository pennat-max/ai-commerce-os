import { AppShell } from "@/components/app-shell";
import { AskAiAssistant } from "@/components/ask-ai-assistant";
import type { QuickQuestion } from "@/components/ask-ai-assistant";
import { recommendCampaignDecision } from "@/lib/campaign-decisions";
import { calculateProfit, formatBaht, formatPercent } from "@/lib/profit";
import { listCampaigns, listProducts } from "@/lib/repositories";

export default async function AssistantPage() {
  const [{ data: products }, { data: campaigns }] = await Promise.all([
    listProducts(),
    listCampaigns(),
  ]);

  const productProfits = products.map((product) => ({
    product,
    profit: calculateProfit(product),
  }));
  const campaignRows = campaigns.flatMap((campaign) => {
    const product = products.find((item) => item.id === campaign.productId);
    if (!product) return [];

    const decision = recommendCampaignDecision(product, campaign);
    return [{ campaign, product, decision }];
  });

  const riskyProducts = productProfits.filter(({ profit }) => profit.status !== "GOOD");
  const lowStockProducts = products.filter((product) => product.stock <= 10);
  const bestProduct = [...productProfits].sort((a, b) => b.profit.netProfit - a.profit.netProfit)[0];
  const worstCampaign = [...campaignRows].sort(
    (a, b) => a.decision.profit.netProfit - b.decision.profit.netProfit,
  )[0];
  const adsRisk = [...productProfits].sort(
    (a, b) => b.product.adsCost / Math.max(1, b.product.sellingPrice) - a.product.adsCost / Math.max(1, a.product.sellingPrice),
  )[0];

  const questions: QuickQuestion[] = [
    {
      id: "worry",
      question: "วันนี้อะไรน่าห่วง",
      answer: {
        tone: riskyProducts.length > 0 ? "yellow" : "green",
        what:
          riskyProducts.length > 0
            ? `พบสินค้า/แคมเปญที่ต้องดู ${riskyProducts.length + Math.max(0, campaignRows.filter((row) => row.decision.recommendation !== "GOOD").length)} รายการ`
            : "วันนี้ยังไม่พบความเสี่ยงหลักจากข้อมูลเดโม",
        why: "รายการที่กำไรต่ำหรือสต็อกต่ำอาจทำให้ร้านเสียกำไร แม้ยอดขายดูดี",
        next: "เปิดดูสินค้าที่เสี่ยงและแคมเปญที่ไม่ผ่านเกณฑ์ก่อนกดอนุมัติ",
      },
    },
    {
      id: "best-profit",
      question: "สินค้าไหนกำไรดีที่สุด",
      answer: {
        tone: "green",
        what: bestProduct
          ? `${bestProduct.product.sku} ทำกำไรพื้นฐานดีที่สุดที่ ${formatBaht(bestProduct.profit.netProfit)}`
          : "ยังไม่มีข้อมูลสินค้าให้เปรียบเทียบ",
        why: bestProduct
          ? `มาร์จินอยู่ที่ ${formatPercent(bestProduct.profit.marginPercent)} จึงเหมาะกับการดันยอดขาย`
          : "AI ต้องมีข้อมูลต้นทุนและราคาขายก่อนจึงจะจัดอันดับได้",
        next: "ใช้สินค้านี้เป็นตัวหลักในแคมเปญสั้นหรือขายคู่กับสินค้าอื่นโดยไม่ลดกำไรมากเกินไป",
      },
    },
    {
      id: "bad-campaign",
      question: "แคมเปญไหนไม่ควรเข้า",
      answer: {
        tone: worstCampaign?.decision.recommendation === "DANGER" ? "red" : "yellow",
        what: worstCampaign
          ? `${worstCampaign.campaign.name} เสี่ยงที่สุด กำไรคาดการณ์ ${formatBaht(worstCampaign.decision.profit.netProfit)}`
          : "ยังไม่มีแคมเปญให้ประเมิน",
        why: "ส่วนลด แคชแบ็ก ค่าส่ง และ ads cost รวมกันอาจกินกำไรเกินเป้าที่ตั้งไว้",
        next: "กด reject หรือปรับส่วนลดก่อนสมัครแคมเปญจริง",
      },
    },
    {
      id: "low-stock",
      question: "ตัวไหนของใกล้หมด",
      answer: {
        tone: lowStockProducts.length > 0 ? "yellow" : "green",
        what:
          lowStockProducts.length > 0
            ? `${lowStockProducts[0].sku} เหลือ ${lowStockProducts[0].stock} ชิ้น และควรเติมก่อน`
            : "ยังไม่มีสินค้าใกล้หมดจาก threshold 10 ชิ้น",
        why: "ถ้าสต็อกหมดระหว่างแคมเปญ ร้านอาจเสียอันดับสินค้าและเสียโอกาสปิดการขาย",
        next: "เติมสต็อกสินค้าขายดีหรือหยุดโปรโมทชั่วคราวจนกว่าสินค้าจะพร้อมขาย",
      },
    },
    {
      id: "ads-risk",
      question: "โฆษณาตัวไหนไม่คุ้ม",
      answer: {
        tone: adsRisk?.profit.status === "DANGER" ? "red" : "yellow",
        what: adsRisk
          ? `${adsRisk.product.sku} ใช้งบโฆษณา ${formatBaht(adsRisk.product.adsCost)} และกำไรสุทธิ ${formatBaht(adsRisk.profit.netProfit)}`
          : "ยังไม่มีข้อมูลงบโฆษณาให้ประเมิน",
        why: "เมื่องบโฆษณาสูงกว่ากำไรที่เหลือ การเร่งยิงโฆษณาจะเพิ่มยอดขายแต่กำไรอาจไม่โต",
        next: "ลดงบหรือปรับราคา/คูปองก่อนเพิ่มงบโฆษณา",
      },
    },
    {
      id: "next-step",
      question: "ควรทำอะไรต่อ",
      answer: {
        tone: "blue",
        what: "ลำดับงานที่คุ้มที่สุดคือเช็กแคมเปญเสี่ยง เติมสต็อกต่ำ แล้วค่อยดันสินค้ากำไรดี",
        why: "การปิดความเสี่ยงก่อนช่วยกันขาดทุน จากนั้นจึงใช้งบกับสินค้าที่มาร์จินดี",
        next: "ไปหน้าแคมเปญเพื่ออนุมัติ/ปฏิเสธ แล้วเปิดหน้าโอกาสทำกำไรเพื่อเลือก action ถัดไป",
      },
    },
  ];

  return (
    <AppShell
      title="ถาม AI"
      subtitle="ผู้ช่วยเดโมที่ตอบจากสินค้า แคมเปญ และสูตรกำไรในระบบ"
    >
      <AskAiAssistant questions={questions} />
    </AppShell>
  );
}
