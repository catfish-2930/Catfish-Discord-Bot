const {request_stream}=require('../request/index.js');
const {PassThrough}=require('stream');
exports.BStream=class BStream{
    constructor(
        url,
        header,
        headerBox,
    ){
       // this.format=format;
        this.header=header;
        this.contentLength=headerBox.range;
        this.video_url=url;
        this.request=null;
        this.timeretry=0;
        this.played=0;
        this.current=-1;
        this.chunkSize=2*1024*1024;
        this.stream=new PassThrough({});
        this.stream.on('close',()=>{
            console.log('stream close')
            this.cleanup();
        });
        this.loop();
    }
    async loop(ry=false){
        if(this.stream.destroyed){
            console.log('stream destroyed')
            this.cleanup();
            return;
        }
        if(!ry){
            this.current++;
        }
        let end=this.played+this.chunkSize;
        if(end>=this.contentLength)end=undefined;
        this.header.headers['Range']=`bytes=${this.played}-${end===undefined?this.contentLength:end}`
        console.log(this.header);
        this.request=await request_stream(this.video_url,this.header).catch(err=>err);
        if(this.request instanceof Error){
            console.log('request error')
            this.cleanup();
            const success=await this.retry();
            if(!success)this.stream.emit('error',this.request);
            return;
        }
        if(Number(this.request.statusCode)>=400){
            console.log('status code>400');
            this.cleanup();
            await this.retry();
            return;
        }
        this.request.pipe(this.stream,{end:end===undefined});
        this.request.on('data',c=>{
            if(!ry){
                this.played+=c.length;
            }
        })
        this.request.once('error',async()=>{
            console.log('request error')
            this.cleanup();
        });
        this.request.on('end',()=>{
            if(end>=this.contentLength){
                console.log('playing end')
                this.stream.end();
                this.cleanup();
            }else{
                if(end!==undefined){
                    console.log('next chunk')
                    this.timeretry=0;
                    this.loop();
                }
            }
        });
        
    }

    async retry(){
        this.retry++;
        if(this.retry>=3)return false;
        await this.loop();
        return true;
    }

    cleanup(){
        this.request?.destroy();
        this.request=null;
        console.log('clean')
    }
}