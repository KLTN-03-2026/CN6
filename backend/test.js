const mang1 =["1","2","3","4"];


const mang2 = [...mang1];
const mang3 =[];
console.log(mang2);
for(let i =mang2.length -1 ;i>0;i--){
   let j = Math.floor(Math.random()*(i+1));
    [mang2[i],mang2[j]] = [mang2[j],mang2[i]]
    console.log(i+" , "+j);
}



console.log(mang1);
console.log(mang2);