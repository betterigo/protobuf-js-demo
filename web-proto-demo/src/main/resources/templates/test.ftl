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
		 ajaxSender.send({
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
			url : "/pb/unauth",
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
	
</script>
</head>
<body>测试protobuffer js 应用
</body>
</html>