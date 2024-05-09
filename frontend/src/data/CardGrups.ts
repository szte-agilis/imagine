
export default class CardTransform {
    id: number; //group id
    card: number; //card id
    

    constructor( card: number,id: number =0 ) {
        this.id = id;
        this.card=card;
    }

     color(def_szin:String ="#ffffff10"):String {
       const szinek=["#B8860B","#8B0000","#00008B","#006400"];
       let s=def_szin;
       if(this.id>0){
        s=szinek[this.id-1];
       }
       
        return s;
    }

    neon_color(def_szin:String ="rgba(46,248,255,0.9)"):String{
        const szinek=["rgba(255, 255, 0, 0.9)","rgba(255, 0, 0, 0.9)","rgba(0, 0, 255, 0.9)","rgba(0, 255, 0, 0.9)"];
        let s=def_szin;
        if(this.id>0){
         s=szinek[this.id-1];
        }
        
         return s;
       
    }

    tag(card_id:number){
        // eslint-disable-next-line eqeqeq
         return (card_id==this.card);
    }
}