import Box_HV_LuyenDe from "./componan/box_hv_luyende";
import ChatBot from "./componan/ChatBot";
import Header from "./componan/header";

export default function HV_luyenDe() {
  return (
    <>
      <Header type="hien" />
      <section className="mx-[50px] my-[20px]">
        <Box_HV_LuyenDe />
      </section>
      <ChatBot />
    </>
  );
}
