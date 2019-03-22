<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>测试protobuf</title>
<script type="text/javascript" src="/js/jquery-1.11.3.min.js"></script>
<script type="text/javascript" src="/js/protobuf.js"></script>
<script type="text/javascript" src="/js/ajaxsender.js"></script>
<script type="text/javascript">
function createXMLHttpRequest(){
    if(window.ActiveXObject){ //IE only
        return new ActiveXObject("Microsoft.XMLHTTP");
    }else if(window.XMLHttpRequest){ //others
        return new XMLHttpRequest();
    }
}
function str2bytes(str){
    var bytes = [];
    for (var i = 0, len = str.length; i < len; ++i) {
        var c = str.charCodeAt(i);
        var byte = c & 0xff;
        bytes.push(byte);
    }
    return bytes;
}
	var p = {username:"admin"}
	$(function() {
				
		console.log("准备开始测试protobuf")
		var ajaxSender = new AjaxSender();
		 ajaxSender.sendData({
			 protoFile:'/proto/user.proto',
			 requestTypeName:'LoadUserRequest',
			 replyTypeName:'LoadUserReply',
			 url:'/pb/user',
			 type:'POST',
			 data:{ username: "admin123" }
		 }).then(res=>{
			 console.log(res)
		 }).catch(err=>{
			 console.warn(err)
		 })
		$.ajax({
			url : "/pb/t1",
			type : 'GET',
			cache : false,
			contentType: "application/json",
			//data :JSON.stringify(p),
			/*  crossDomain: true,
			 xhrFields: {
			     withCredentials: true
			  }, */
			success : function(res) {
				console.log(res);
			}
		})
	})
	protobuf.load("/proto/user.proto", function(err, root) {
		 var AwesomeMessage = root.lookupType("LoadUserRequest");
		 var LoadUserReply = root.lookupType("LoadUserReply")
		 var payload = { username: "admin" };
		 var errMsg = AwesomeMessage.verify(payload);
		 if(errMsg){
			 console.log("protoBuf编码错误"+errMsg)
		 }
		 var message = AwesomeMessage.create(payload);
		 console.log(message)
		 var buffer = AwesomeMessage.encode(message).finish();	
		 console.log(buffer)
 		 var xhr = createXMLHttpRequest();
		 xhr.open("POST", "/pb/user");
		 xhr.setRequestHeader("Content-Type","application/x-protobuf");
		 xhr.setRequestHeader("Accept","application/x-protobuf");
		 if ("overrideMimeType" in xhr){			 
	            xhr.overrideMimeType("text/plain; charset=x-user-defined");
			 }
		 xhr.responseType = 'arraybuffer';
		/*  if (xhr.overrideMimeType){
			    //这个是必须的，否则返回的是字符串，导致protobuf解码错误
			    //具体见http://www.ruanyifeng.com/blog/2012/09/xmlhttprequest_level_2.html
			    xhr.overrideMimeType("text/plain; charset=x-user-defined");
			} */
		 xhr.onreadystatechange = function(){
			    if (xhr.readyState == 4 && xhr.status == 200) {
			        var data = xhr.response;
			        var result = new Uint8Array(data)
			        var protobufResp = LoadUserReply.decode(result);
			        console.log(protobufResp)
			        var jsonResp = JSON.stringify(protobufResp);
			        console.log(jsonResp);
			    }
			};
		 xhr.send(buffer); 
	})
	
</script>
</head>
<body>测试protobuffer js 应用
</body>
</html>