const https_request=require('node:https');
const {brotliDecompress,deflate,gunzip,createGunzip,createBrotliDecompress,createDeflate}=require('node:zlib');
//'user-agent'
exports.request=(req_url,options={method:'GET'},response=false)=>{
    return new Promise(async(resolve,reject)=>{
        if(options.headers){
            options.headers={
                ...options.headers,
                'accept-encoding':'gzip, deflate, br',
            };
        }
        const res=await internalRequest(req_url,options).catch((err)=>err);
        if(res instanceof Error){
            reject(res);
            return;
        }
        const data=[];
        let decoder=undefined;
        const encoding=res.headers['content-encoding'];
        if(encoding==='gzip')decoder=createGunzip();
        else if(encoding==='br')decoder=createBrotliDecompress();
        else if(encoding==='deflate')decoder=createDeflate();

        if(decoder){
            res.pipe(decoder);
            decoder.setEncoding('utf-8');
            decoder.on('data',(c)=>data.push(c));
            decoder.on('end',()=>{
                response?resolve({
                    headers:res.headers,
                    body:data.join(''),
                }):resolve(data.join(''))
            });
        }else{
            res.setEncoding('utf-8');
            res.on('data',(c)=>data.push(c));
            res.on('end',()=>{
                response?resolve({
                    headers:res.headers,
                    body:data.join(''),
                }):resolve(data.join(''));
            });
        }
    })
}

exports.request_stream=(req_url,options={method:'GET'})=>{
    return new Promise(async(resolve,reject)=>{
        let res=await https_getter(req_url,options).catch(err=>err);
        if(res instanceof Error){
            reject(res);
            return;
        }
        if(Number(res.statusCode)>=300&&Number(res,statusCode)<400){
            res=await request_stream(res.headers.location,options);
        }
        resolve(res);
    });
}

function internalRequest(req_url,options){
    return new Promise(async(resolve,reject)=>{
        let res=await https_getter(req_url,options).catch(err=>err);
        if(res instanceof Error){
            reject(res);
            return;
        }
        if(Number(res.statusCode)>=300&&Number(res.statusCode)<400){
            res=await internalRequest(res.headers.location,options);
        }else if(Number(res.statusCode)>400){
            reject(new Error(`Got ${res.statusCode} from request`));
            return;
        }
        resolve(res);
    });
}

function https_getter(req_url,options){
    return new Promise((resolve,reject)=>{
        const s=new URL(req_url);
        options.method??='GET';
        const req_options={
            host:s.hostname,
            path:s.pathname+s.search,
            headers:options.headers??{},
            method:options.method
        };
        const req=https_request.request(req_options,resolve);
        req.on('error',err=>{
            reject(err);
        });
        if(options.method==='POST')req.write(options.body);
        req.end();
    });
}