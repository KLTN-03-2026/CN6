const link1 ="https://drive.google.com/file/d/1QBfc88gw5YyRuz86LrU04d9iITEHM2HM/view?usp=drive_link"
const link2 ="https://nads.1cdn.vn/2024/11/22/74da3f39-759b-4f08-8850-4c8f2937e81a-1_mangeshdes.png";

const link1Tach = link1.split(".")[0];
 
const link2Tach = link2.split('.')[0];

const layidDriver1 = link1.split('/d/')[1]
const layidDriver2 = layidDriver1.split('/view')[0];


const chec= "";
const check2="124"

if((chec && check2) !==""){
    console.log("true")
}else{
    console.log("false")
}