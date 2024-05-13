
    export function color(id:number, def_color:String ="#ffffff10"):String {
       const c=["#B8860B","#8B0000","#00008B","#006400"];
       let s=def_color;
       if(id>0){
        s=c[id-1];
       }
       
        return s;
    }

    export function neon_color(id:number,def_color:String ="rgba(46,248,255,0.9)"):String{
        //const c=["rgba(255, 255, 0, 0.9)","rgba(255, 0, 0, 0.9)","rgba(0, 0, 255, 0.9)","rgba(0, 255, 0, 0.9)"];
        
        let s=def_color;
        
        if(id>0){
            s="rgba(255, 255, 255, 0.9)";
        }
        
        return s;
       
    }

    