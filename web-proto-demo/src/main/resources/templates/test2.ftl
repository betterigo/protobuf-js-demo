<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>测试protobuf</title>
<script type="text/javascript" src="/js/jquery-1.11.3.min.js"></script>
<script type="text/javascript" src="/js/ajaxsender.js"></script>
<script type="text/javascript" src="/js/bundle.min.js"></script>
<script type="text/javascript">
function str2bytes(str){
    var bytes = [];
    for (var i = 0, len = str.length; i < len; ++i) {
        var c = str.charCodeAt(i);
        var byte = c & 0xff;
        bytes.push(byte);
    }
    return bytes;
}
$(function(){
	var loadUserRequest = new proto.LoadUserRequest();
	loadUserRequest.setUsername("test123")
	var xhr = new XMLHttpRequest();
	  xhr.open("POST","/pb/user");
      xhr.setRequestHeader("Content-Type","application/x-protobuf");
      xhr.setRequestHeader("Accept", "application/x-protobuf");
      if ("overrideMimeType" in xhr){			 
             xhr.overrideMimeType("text/plain; charset=x-user-defined");
          }
      xhr.responseType = 'arraybuffer'
      
    	  xhr.onreadystatechange = function fetchOnReadyStateChange() {
          if (xhr.readyState !== 4){
              return undefined;
          }
          if (xhr.status !== 0 && xhr.status !== 200){
              //return callback(Error("status " + xhr.status));
          }
          var buffer = xhr.response;
          if(!buffer){
              return undefined;
          }
          var dataResp = new Uint8Array(buffer);
          var result = proto.LoadUserReply.deserializeBinary(dataResp)
          console.log(result)
          console.log(result.toObject())
      }
      xhr.send(loadUserRequest.serializeBinary())
      
      
      var ajaxSender = new AjaxSender();
      ajaxSender.sendPb({
    	  url:'/pb/user',
		  type:'POST',
		  data:loadUserRequest,
		  replyType:proto.LoadUserReply,
	//	  resultType:'proto'
      }).then(res=>{
    	  console.log(res)
      }).catch(err=>{
    	  console.log(err)
      })
	})
	
</script>
</head>
<body>测试protobuffer js 应用 test2
</body>
</html>