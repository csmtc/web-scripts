if($('seccode_cSAXxq9w')) {
	if(!$('vseccode_cSAXxq9w')) {
		var sectpl = seccheck_tpl['cSAXxq9w'] != '' ? seccheck_tpl['cSAXxq9w'].replace(/<hash>/g, 'codecSAXxq9w') : '';
		var sectplcode = sectpl != '' ? sectpl.split('<sec>') : Array('<br />',': ','<br />','');
		var string = '<input name="seccodehash" type="hidden" value="cSAXxq9w" /><input name="seccodemodid" type="hidden" value="forum::viewthread" />' + sectplcode[0] + '验证码' + sectplcode[1] + '<input name="seccodeverify" id="seccodeverify_cSAXxq9w" type="text" autocomplete="off" style="ime-mode:disabled;width:100px" class="txt px vm" onblur="checksec(\'code\', \'cSAXxq9w\', 0, null, \'forum::viewthread\')" />' +
			' <a href="javascript:;" onclick="updateseccode(\'cSAXxq9w\');doane(event);" class="xi2">换一个</a>' +
			'<span id="checkseccodeverify_cSAXxq9w"><img src="' + STATICURL + 'image/common/none.gif" width="16" height="16" class="vm" /></span>' +
			sectplcode[2] + '<span id="vseccode_cSAXxq9w">输入下图中的字符<br /><img onclick="updateseccode(\'cSAXxq9w\')" width="100" height="30" src="misc.php?mod=seccode&update=86813&idhash=cSAXxq9w" class="vm" alt="" /></span>' + sectplcode[3];
		evalscript(string);
		$('seccode_cSAXxq9w').innerHTML = string;
	} else {
		var string = '输入下图中的字符<br /><img onclick="updateseccode(\'cSAXxq9w\')" width="100" height="30" src="misc.php?mod=seccode&update=86813&idhash=cSAXxq9w" class="vm" alt="" />';
		evalscript(string);
		$('vseccode_cSAXxq9w').innerHTML = string;
	}
	
}