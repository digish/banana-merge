function reset_stuff()
{
	document.getElementById("file_load_b").value = "";
}

function cfile() {
//	this.orig                 = new Array();
//	this.formated             = new Array();
//	this.status               = new Array();
	this.doc;
	this.ppdoc;
	this.sc;
	this.length_of_file;
	this.number_of_slice;
	this.processinglength;
	this.number_of_slice;
}

var files = new Array();
files[0]  =   new cfile;
files[1]  =   new cfile;
files[2]  =   new cfile;

var total_files = 0;
var compare_expert = new Worker("banana_worker.js");
compare_expert.onmessage = function(event) {
    remotedata = event.data;
	switch(event.data.msg) {
	case "first":
		send_data("first");
		break;
	case "second":
		send_data("second");
		break;    
	case "init_done":
        files[0].ppdoc.className="editor showme size2 pos1";
        files[1].ppdoc.className="editor showme size2 pos3"; 
	case "all":
        formated_print();    
		send_data("all");
		break;    
	case "done":
        formated_print();  
		break;
	case "debug":
		console.log(event.data.msglog);
		break;
	default:
		alert("invalid msg");
	break;    
	}
}

compare_expert.onerror = function(error) {
	dump("Worker error: " + error.message + "\n");
	throw error;
}


//start comparison
function start_compare()
{
	init_compare();
	// initialise worker
	compare_expert.postMessage("init");
}

// Initialise comparison 
function init_compare()
{
	// file 1
	files[0].doc =   document.getElementById('editor1');
    files[0].ppdoc = document.getElementById('editor_pp1'); 
    files[0].ppdoc.innerHTML = "";
	files[0].length_of_file =  (files[0].doc.value).length;
	files[0].processinglength = files[0].length_of_file;	
	files[0].sc = 0;
	// file 2
	files[1].doc =   document.getElementById('editor2');
    files[1].ppdoc = document.getElementById('editor_pp2'); 
    files[1].ppdoc.innerHTML = "";
	files[1].length_of_file =  (files[1].doc.value).length;
	files[1].processinglength = files[1].length_of_file;
	files[1].sc = 0;
	
    // file 3
    files[2].doc =   document.getElementById('editor3');
    files[2].ppdoc = document.getElementById('editor_pp3'); 
    files[2].ppdoc.innerHTML = "";
    files[2].length_of_file =  (files[2].doc.value).length;
    files[2].processinglength = files[2].length_of_file;
    files[2].sc = 0;

}

// send data to worker
function send_data(mode)
{
	var transfer_bite = new Array();
	var message_to_send;
	switch(mode) 
	{
	case "all":
		transfer_bite[0] = "all";
		prepare_packate(transfer_bite,0);
		prepare_packate(transfer_bite,1);
		message_to_send = transfer_bite[0]+"*#magic#*"+transfer_bite[1]+"*#magic#*"+transfer_bite[2];
		break;
	case "first":
		transfer_bite[0] = "first";
		prepare_packate(transfer_bite,0);
		message_to_send = transfer_bite[0]+"*#magic#*"+transfer_bite[1];
		break;
	case "second":
		transfer_bite[0] = "second";
		prepare_packate(transfer_bite,0);
		message_to_send = transfer_bite[0]+"*#magic#*"+transfer_bite[1];
		break;
	default:
		message_to_send="";
	break;
	}
	
	// send message to worker
	compare_expert.postMessage(message_to_send);
}

var sc = 0;
var lineNum = 1;

function formated_print()
{
    var i;
    var res;
    for (i=sc; i < remotedata.Astatus.length ; i++)
    {
      res = "<span class=\"modified_right_line\">|"+lineNum+"|</span><span class=\"unmodifed_line\">"+remotedata.Astatus[i]+"</span><br />"
      files[0].ppdoc.innerHTML = files[0].ppdoc.innerHTML+res;
      
      res = "<span class=\"modified_right_line\">|"+lineNum+"|</span><span class=\"unmodifed_line\">"+remotedata.Bstatus[i]+"</span><br />"
      files[1].ppdoc.innerHTML = files[1].ppdoc.innerHTML+res;
      
//        files[1].ppdoc.innerHTML = files[1].ppdoc.innerHTML+formatedres[1];
//        files[2].ppdoc.innerHTML = files[2].ppdoc.innerHTML+formatedres[2];
      lineNum++; 
    }
    sc = i;
}

/*
function format_string(i) 
{
    var k=0;
    switch(remotedata.Astatus)
    {
    case "nr":
    case "nl":
        formatedres[0] = "<span class=\"unmodifed_line\">"++"</span><br />";
        break;
    case "partmr":
    case "partml":
        c.formated[i] = "<span class=\"changed_part\">"+c.orig[i]+"</span><br />";
        break;
    case "ar":
    case "al":
        c.formated[i] = "<span class=\"missing_line\">"+""+"</span><br />";
        break;
    case "mr":
        c.formated[i] = "<span class=\"modified_right_line\">"+c.orig[i]+"</span><br />";
        break;
    case "ml":
        c.formated[i] = "<span class=\"modified_left_line\">"+c.orig[i]+"</span><br />";
        break;
    default :

        var words = c.orig[i].split(" ");
    c.formated[i] = "";
    for ( k=0; k < words.length ; k++) 
    {
        if(c.status[i][k] == "m") 
        {
            c.formated[i] =c.formated[i]+"<span class=\"unmodifed_line\">"+words[k]+"</span>";
        }
        else
        {
            c.formated[i] =c.formated[i]+"<span class=\"changed_part\">"+words[k]+"</span>";
        }

    }
    if (k) {
        c.formated[i] =c.formated[i]+"<br />"
    }
    break;
    }

}
*/



// prepare packet for sending to worker
function prepare_packate(transfer_bite,i) {

	// number of bytes from file to send
	var unitp = 200;
    var buf_adjustment = 0;
    var a;
    var pos = 0;
    
	if (files[i].processinglength > unitp) 
	{
		transfer_bite[i+1] = files[i].doc.value.slice(files[i].sc,files[i].sc+unitp);
		pos = transfer_bite[i+1].lastIndexOf('\n');
		if (-1 != pos)
		{
          a = transfer_bite[i+1].slice(0, pos);
          transfer_bite[i+1] = a;
          
          files[i].processinglength = files[i].processinglength - (pos + 1);
          files[i].sc = files[i].sc + pos + 1;
		}
		else
		{
		  // lines is very long so increase unitp
		  alert("This file is not supported line not fitting to unit porcessing size ");
		  return;
		}
	}
	else if (files[i].processinglength != 0)
	{
		transfer_bite[i+1] = files[i].doc.value.slice(files[i].sc);
		files[i].processinglength = 0;
		files[i].sc = files[i].length;
	}
	else
	{
		transfer_bite[i+1] = "";
	}
}


//function compare2() {
//
//	files[0].orig =  (document.getElementById('editor1').value).split('\n');
//	files[1].orig =  (document.getElementById('editor2').value).split('\n');
//
//
//	var i;
//	var j;
//	var k = 0;
//	var p = 0;
//	var matched=0;
//	var left="l";
//	var right="r";
//
//	var s1 = new Array();
//	var s2 = new Array();
//
//	if (files[0].orig.length < files[1].orig.length)
//	{
//		i = files[0];
//		files[0] = files[1];
//		files[1] = i;
//		i = ppl;
//		ppl = ppr;
//		ppr = i;
//
//		left="r";
//		right="l";
//
//	}
//
//	for (i=0; i < files[0].orig.length; i++)
//	{
//		j=k;
//		if (j >= files[1].orig.length) 
//		{
//			files[1].orig = files[1].orig.concat("");
//			files[1].status[i] = "a"+left; // Added for left
//			files[0].status[i] = "m"+right; // missing in right
//			j++;
//			continue;
//		}
//
//		for ( ; j < files[1].orig.length; j++)
//		{
//			if (files[0].orig[i] == files[1].orig[j]) {
//
//				matched = 1;
//
//				if (i != j)
//				{
//
//					p = j-i;
//					for (; p > 0 ; p-- )
//					{
//						var slice_pre;
//						var slice_post;
//						slice_pre  = files[0].orig.slice(0,i);
//						slice_post = files[0].orig.slice(i,files[0].orig.length);
//						files[0].orig = slice_pre.concat("",slice_post);
//						files[0].status[i]="a"+right; // Added for right
//						files[1].status[i]="m"+left; // Missing in left
//						i++;
//					}
//
//				}
//				k=j+1;
//
//				files[0].status[i] = "n"+right;  // normal with right
//				files[1].status[i] = "n"+left; // normal with left
//
//				break;
//			}
//			else if (1 == match_percentage(files[0].orig[i],files[1].orig[j],s1,s2))
//			{
//				matched = 1;
//
//				if (i != j)
//				{
//					p = j-i;
//					for (; p > 0 ; p-- )
//					{
//						var slice_pre;
//						var slice_post;
//						slice_pre  = files[0].orig.slice(0,i);
//						slice_post = files[0].orig.slice(i,files[0].orig.length);
//						files[0].orig = slice_pre.concat("",slice_post);
//						files[0].status[i]="a"+right; // Added for right
//						files[1].status[i]="m"+left; // Missing in left
//						i++;
//					}
//
//				}
//				k=j+1;
//				//files[0].status[i]="partm"+right; // partial match right
//				//files[1].status[i]="partm"+left; // partial match left
//				files[0].status[i]=s1; // partial match right
//				files[1].status[i]=s2; // partial match left
//				s1 = new Array();
//				s2 = new Array();
//				break;
//			}
//
//		}
//
//		if (matched == 1) 
//		{
//			matched = 0;
//		}
//		else
//		{
//			var slice_pre;
//			var slice_post;
//			slice_pre  = files[1].orig.slice(0,i);
//			slice_post = files[1].orig.slice(i,files[1].orig.length);
//			files[1].orig = slice_pre.concat("",slice_post);
//			files[1].status[i]="a"+left; // Added for left
//			files[0].status[i]="m"+right; // Missing in right
//			k++;
//		}
//	}
//
//	ppl.innerHTML = "";
//	ppr.innerHTML = "";
//
//	formated_print(ppl,ppr,files[0],files[1]);
//
//	document.getElementById('editor1').style.display = 'none';
//	document.getElementById('editor2').style.display = 'none';
//	document.getElementById('editor3').style.display = 'none';
//
//	document.getElementById('editor_pp1').style.display = 'block';
//	document.getElementById('editor_pp2').style.display = 'block';
//	// document.getElementById('editor_pp3').style.display = 'block';
//}


function load()
{
	var r = new Array();
	var ed = new Array();	
	var f = new Array();
	var loopid;
	var finput = document.getElementById("file_load_b");
	var i = finput.files.length;

	ed[0] = document.getElementById("editor1"); 
	ed[1] = document.getElementById("editor2"); 
	ed[2] = document.getElementById("editor3"); 


	for ( loopid = 0 ; i > 0 && total_files < 3 ; i-- , loopid++ )
	{
		r[loopid] = new FileReader();
		f[loopid] = finput.files[loopid];
		switch(total_files+1) {
		case 1:
			r[loopid].onload = function(e) { ed[0].innerHTML = e.target.result; }
			break;
		case 2:
			r[loopid].onload = function(e) {ed[1].innerHTML = e.target.result; }
			break;
		case 3:
			r[loopid].onload = function(e) {ed[2].innerHTML = e.target.result; }
			break;
		}
		r[loopid].readAsText(f[loopid]);
		total_files++;
	}


	switch (total_files) {
	case 1:
		ed[0].className="editor showme size1 pos1"; 
		break;
	case 2:
		ed[1].className="editor showme size2 pos3"; 
		ed[0].className="editor showme size2 pos1";
		document.getElementById("compare").className = "button showme";
		break;
	case 3:
		ed[2].className="editor showme size3 pos4"; 
		ed[1].className="editor showme size3 pos2"; 
		ed[0].className="editor showme size3 pos1";
		document.getElementById("compare").className = "button showme";		
		break;

	}

}

function format(c) { document.execCommand(c, false, false); }


//function match_percentage(l1,l2,s1,s2) {
//	lw1 = l1.split(" ");
//	lw2 = l2.split(" ");
//
//	var total_match = 0;
//	var percentage = 0;
//
//	var i,j,k;
//	k = 0;
//
//	for (i=0 ; i < lw1.length ; i++ ) {
//		for (j=k; j < lw2.length ; j++) {
//			if (lw1[i] == lw2[j]) {
//				total_match++;
//				s1[i]="m"
//					s2[j]="m"
//						k=j+1;
//				break;
//			}
//		}
//	}
//
//	percentage = 100*total_match/lw1.length;
//	if (percentage >= 30)
//	{
//		return 1;
//	}
//	else
//	{
//		return 0;
//	}
//}




var ref1=document.getElementById('editor1'),
ref2=document.getElementById('editor2'),
ref3=document.getElementById('editor3');
var vPos1=ref1.scrollTop,
vPos2=ref2.scrollTop,
vPos3=ref3.scrollTop;

function scrollsync() 
{
	if(ref1.scrollTop!=vPos1) 
	{
		vPos1=ref3.scrollTop=ref2.scrollTop=ref1.scrollTop;
	}
	else if(ref2.scrollTop!=vPos2) 
	{
		vPos2=ref3.scrollTop=ref1.scrollTop=ref2.scrollTop;
	}
	else if (ref3.scrollTop!=vPos3) 
	{
		vPos3=ref1.scrollTop=ref2.scrollTop=ref3.scrollTop;
	}
	setTimeout('scrollsync()',1500)

}


window.onload=scrollsync;
window.onload=reset_stuff;
