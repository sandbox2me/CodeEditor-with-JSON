ace.require("ace/ext/language_tools");
var Range = ace.require("ace/range").Range;
var curMarker = [];

// var codeEditor = ace.edit("code_editor");
// codeEditor.setTheme("ace/theme/github");
// codeEditor.getSession().setMode("ace/mode/javascript");
// codeEditor.setOptions({
// 	enableBasicAutocompletion: true,
// 	enableSnippets: true,
// 	enableLiveAutocompletion: true,
// });

var jsonEditor = ace.edit("json_editor");
jsonEditor.setTheme("ace/theme/github");
jsonEditor.getSession().setMode("ace/mode/json");
jsonEditor.setReadOnly(false);
jsonEditor.setHighlightActiveLine(true);
jsonEditor.on('click', function(){
	regex = /"(\w+?)"/,
	count = 0,
	colJson = [];
	var curCursor = jsonEditor.getSelection().getCursor();
	var curLine = jsonEditor.getSession().getDocument().getLine(curCursor.row);
	var tabLine = curLine.split('\t').length - 1;
	var token = jsonEditor.getSession().getTokenAt(curCursor.row, curCursor.column);

	if (token && token.type == "variable" && (curLine.search(/\{/) == -1)) {

		for (var i = curCursor.row; i >= 0; i--) {
			var curValue = jsonEditor.getSession().getDocument().getLine(i);
			var curTabLine = curValue.split('\t').length - 1;
			var result = curValue.match(regex);
			if (curTabLine < tabLine && curTabLine !== 0 && result && result.length > 1) {
				tabLine = curTabLine;
				colJson[count] = curValue.match(regex)[1];
				count++;				
			}
		}

		if (curLine && curLine.match(regex).length > 1) {
			colJson.unshift(curLine.match(regex)[1]);
		}
		var paramWord = colJson[colJson.length - 1];

		for (var j = colJson.length - 2; j >= 0; j--) {
			paramWord = paramWord + "[\"" + colJson[j] + "\"]";
		}
		codeEditor.insert(paramWord);
	}
});
jsonEditor.on('mousemove', function(e){
	this.x = e.clientX;
	this.y = e.clientY;
	var r = jsonEditor.renderer;
	var canvasPos = r.rect || (r.rect = r.scroller.getBoundingClientRect());
	var offset = (this.x + r.scrollLeft - canvasPos.left - r.$padding) / r.characterWidth;
	var row = Math.floor((this.y + r.scrollTop - canvasPos.top) / r.lineHeight);
	var col = Math.round(offset);
	var screenPos = {row: row, column: col, side: offset - col > 0 ? 1 : -1};
	var session = jsonEditor.getSession();
	var docPos = session.screenToDocumentPosition(screenPos.row, screenPos.column);
	var token = session.getTokenAt(docPos.row, docPos.column);
	var curMouseCursor = document.elementFromPoint(this.x, this.y);

	if (token && token.type == "variable") {
		this.token = token;
		session.removeMarker(this.marker);
		this.range = new Range(docPos.row, token.start, docPos.row, token.start + token.value.length);
		this.marker = session.addMarker(this.range, "myOwnHighLightSelect", "text");
		curMarker.push(this.marker);
		
		if (curMouseCursor.getElementsByClassName("myOwnHightLightSelect")){
			curMouseCursor.className += " customCursor";
		}
	}

	for (var i = 0; i < curMarker.length-1; i++){
		jsonEditor.getSession().removeMarker(curMarker[i]);
	}		

	if (curMarker && token.type != "variable") {
		for (var i = 0; i < curMarker.length; i++){
			jsonEditor.getSession().removeMarker(curMarker[i]);
		}		
		curMouseCursor.classList.remove("customCursor");
	}
});
