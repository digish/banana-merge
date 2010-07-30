/*
    Copyright 2010 Digish Pandya <digish.pandya@gmail.com>

    This file is part of Banana-Merge a web based merging tool.
    Banana-Merge is free software: you can redistribute it and/or modify it under the
    terms of the GNU General Public License as published by the Free Software 
    Foundation, either version 3 of the License, or (at your option) any later 
    version. Banaa-Merge is distributed in the hope that it will be useful, 
    but WITHOUT ANY WARRANTY; without even the implied warranty of 
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General 
    Public License for more details.
    
    You should have received a copy of the GNU General Public License along 
    with Banana-Merge. If not, see http://www.gnu.org/licenses/.
*/
function cfile() {
	this.doc;
	this.ppdoc;
	this.sc;
	this.processinglength;
	this.number_of_slice;
	this.textlines;
	this.loaded;
	this.vPos;
	this.vppPos;
}

function banana_m() {
	this.formated_block1;
    this.formated_block2;	
	this.number_of_max_files;
	this.total_files;
	this.w_init_done;
	this.compare_expert;
	this.files;
	this.diffresult_type = function() {
		this.diff;
		this.showed;
	}
	this.diffresult;
	this.diffrescntr;

}

var banana = new banana_m();

function banana_reset()
{
	if (banana) {
		delete banana;
		banana = new banana_m;
	}
	banana.number_of_max_files = 3;

	banana.files = new Array(banana.number_of_max_files);
	for (var i = 0; i < banana.number_of_max_files ; i++) {
		banana.files[i]  =   new cfile();
		banana.files[i].doc =   document.getElementById('editor'+i);
	    banana.files[i].ppdoc = document.getElementById('editor_pp'+i);
	    banana.files[i].ppdoc.innerHtml = "";
		banana.files[i].processinglength = (banana.files[i].doc.value).length;	
		banana.files[i].sc = 0;
		banana.files[i].loaded = 0;
		banana.files[i].vPos = 0;
		banana.files[i].vppPos = 0;
	}
	banana.total_files = 0;
	banana.w_init_done = 0;
	document.getElementById("file_load_b").value = "";
	banana.compare_expert = new Worker("banana_matcher.js");
	banana.compare_expert.onmessage = matcher_event_process;
	banana.compare_expert.onerror = matcher_error_process;
	banana.formated_block1 = "";
	banana.formated_block2 = "";
	banana.diffresults = new Array(banana.number_of_max_files-1);
	for (var i = 0; i < banana.number_of_max_files-1 ; i++) {
		banana.diffresults[i] = new banana.diffresult_type();
		banana.diffresults[i].showed = 0;
	}
	banana.diffrescntr = 0;
}

function w_pkt()
{
	function diff_info(){
		this.fidx1;
		this.fidx2;
	}
	
	function file_info(){
		this.findex;
		this.lines = new Array();
	}
	
	this.msgtype;
	this.file = new file_info();
	this.diffreq = new diff_info();
	this.initreq;
}

function matcher_event_process(event) {
    remotedata = event.data;
	switch(event.data.msg) {
	case "more_data":
		send_to_worker(event.data.pkt);
		break;
	case "init_done":
		banana.w_init_done = 1;
		send_to_worker(null);
	    break;
	case "diff_result":
		banana.diffresults[banana.diffrescntr].diff = event.data.pkt;
		banana.diffrescntr++;
		switch (banana.total_files) {
	    case 2:
            banana.files[0].ppdoc.className="editor_pp showme size2 ";
            banana.files[1].ppdoc.className="editor_pp showme size2 ";
	        break;
	    case 3:
            banana.files[0].ppdoc.className="editor_pp showme size3 ";
            banana.files[1].ppdoc.className="editor_pp showme size3 "; 
            banana.files[2].ppdoc.className="editor_pp showme size3 ";
            break;
	    }
		if (banana.diffrescntr == banana.total_files-1) {
			show_diff();
		}
		break;
	case "debug":
		console.log(event.data.pkt);
		break;
	default:
		alert("invalid msg");
	    break;    
	}
}
function matcher_error_process(error) {
	dump("Worker error: " + error.message + "\n");
	throw error;
}
/*
 * Aero Direction
 * 0 --
 * 1 ->
 * 2 <-
 * 3 <->
 * */
function create_block (tag, c, data, aero) {
	var id = document.createElement(tag);
	var sp_m = document.createElement("span");

	id.className = c;
	
	//if (aero == 0) {
		/* no aero */
		sp_m.appendChild(document.createTextNode(data));
		id.appendChild(sp_m);
	//}
	/*	
	else if (aero == 1) {
		sp_m.appendChild(document.createTextNode(data));
		id.appendChild(sp_m);

		var sp_b = document.createElement("input");
		sp_b.className = "m_ctrl_b";
		sp_b.value=">";
		sp_b.type = "button";
		sp_b.addEventListener('click', merge_block, false);
		//sp_b.appendChild(document.createTextNode(">"));
	    id.appendChild(sp_b);
	}
	else if (aero == 2)
	{
		sp_m.appendChild(document.createTextNode(data));
		id.appendChild(sp_m);

		var sp_b = document.createElement("input");
		sp_b.className = "m_ctrl_b";
		sp_b.value="<";
		sp_b.type = "button";
		sp_b.addEventListener('click', merge_block, false);

		//sp_b.appendChild(document.createTextNode("<"));
	    id.appendChild(sp_b);
	}
	else
	{
		
		
	}*/
	return id;
}
function merge_block() {
	alert("Not implemented yet");
}


function combine_diff_result(match1,match2) {
  var tblock1;
  var tblock2;
  var m1_start_blk_idx = -1;
  var m1_end_blk_idx = -1;
  // select m2 first
  for (var idx in match2) {
	// Select blocks one by one in loop
	var blockm2 = match2[idx];
	switch(blockm2[0]) {
	case "equal":
       continue;
	default:
	// skip till first un equal block comes. (As equal block do not conflict)
	// if unequal type
		
		for (var j = 0; j < match1.length; j++) {
			var blockm1 = match1[j];
			// determine in which block of m1 does it start(tell it x)
			if (blockm2[1] >= blockm1[3] && blockm2[1] < blockm1[4]) {
				m1_start_blk_idx = j;
			}
            // determine in which block of m1 does it end(tell it y)
			if (blockm2[2] >= blockm1[3] && blockm2[2] < blockm1[4]) {
				m1_end_blk_idx = j;
			}
			
			if ((blockm2[1] == blockm2[2]) && (blockm1[3] == blockm1[4]) && (blockm1[3] == blockm2[1])) {
				m1_start_blk_idx = j;
				m1_end_blk_idx = j;
				break;
			}
			
			if (m1_start_blk_idx != -1 &&  m1_end_blk_idx != -1) {
				break;
			}
		}
		
    	// for all the blocks from x to y in m1 need to be modified
    	if (m1_end_blk_idx - m1_start_blk_idx == 0) {
        // modify starting/ending block in one shot
    		
    		/* part from m1 */
    		match1[m1_start_blk_idx].push(match1[m1_start_blk_idx][0]);
    		match1[m1_start_blk_idx].push(match1[m1_start_blk_idx][3]);
    		match1[m1_start_blk_idx].push(blockm2[1]);
    		
    		/* part from m2 */
    		match1[m1_start_blk_idx].push(blockm2[0]);
    		match1[m1_start_blk_idx].push(blockm2[1]);
    		match1[m1_start_blk_idx].push(blockm2[2]);
    		
    		/* part from m1 */
    		match1[m1_start_blk_idx].push(match1[m1_start_blk_idx][0]);
    		match1[m1_start_blk_idx].push(blockm2[2]);
    		match1[m1_start_blk_idx].push(match1[m1_start_blk_idx][4]);
    		
    		
    	} else {
    	// modify starting blockm2
    		/* part from m1 */
    		match1[m1_start_blk_idx].push(match1[m1_start_blk_idx][0]);
    		match1[m1_start_blk_idx].push(match1[m1_start_blk_idx][3]);
    		match1[m1_start_blk_idx].push(blockm2[1]);
    		
    		/* part from m2 till the boundary starting of block of m1 */
    		match1[m1_start_blk_idx].push(blockm2[0]);
    		match1[m1_start_blk_idx].push(blockm2[1]);
    		match1[m1_start_blk_idx].push(match1[m1_start_blk_idx][4]);
    		
        	// modify end block
    		
    		/* part from m2 starting at boundary of ending block of m2 */
    		match1[m1_end_blk_idx].push(blockm2[0]);
    		match1[m1_end_blk_idx].push(match1[m1_end_blk_idx][3]);
    		match1[m1_end_blk_idx].push(blockm2[2]);
    		
    		/* part from m1  */
    		match1[m1_end_blk_idx].push(match1[m1_end_blk_idx][0]);
    		match1[m1_end_blk_idx].push(blockm2[2]);
    		match1[m1_end_blk_idx].push(match1[m1_end_blk_idx][4]);
    	
         	// modify middle blocks in loop
    		for (var k = m1_start_blk_idx + 1; k < m1_end_blk_idx; k++) {
    			march1[k].push(blockm2[0]);
    			march1[k].push(match1[k][3]);
    			march1[k].push(match1[k][4]);
    		}
    		
    	}
	}
	
	m1_start_blk_idx = -1;
	m1_end_blk_idx = -1;
	
  }	
}


function show_diff() {
	var f1idx = 0;
	var f2idx = 1;
	var f3idx = 2;
	
	var match_result =  banana.diffresults[0].diff.output;
	if (banana.diffrescntr > 1) {
		var match_result2 =  banana.diffresults[1].diff.output;
//		combine_diff_result(match_result,match_result2);
	}
	
	for (var idx in match_result) {
		var block = match_result[idx];
		switch(block[0]) {
			case "equal":
				banana.formated_block1 = (banana.files[f1idx].textlines.slice(block[1],block[2])).join("\n");
				var tb1 = create_block("pre","unmodifed_line",banana.formated_block1,0);
				var tb2 = create_block("pre","unmodifed_line",banana.formated_block1,0);
			    banana.files[f1idx].ppdoc.appendChild(tb1);
			    banana.files[f2idx].ppdoc.appendChild(tb2);
		    
				break;
			case "insert":	
			case "delete":
				var one,two,b1,b2,b3,b4,f1,f2;
				if (block[4] - block[3] == 0) {
					one = "missing_line";
					two = "modified_right_line";
					b1 = block[1];
					b2 = block[2];
					f1 = f1idx;
					f2 = f2idx;
					aero1 = 1;
					aero2 = 2;
					
				} else {
					one = "modified_left_line";
					two = "missing_line";
					f1 = f2idx;
					f2 = f1idx;
					b1 = block[3];
					b2 = block[4];
					aero1 = 2;
					aero2 = 1;
				}
				
				//banana.formated_block1 = (banana.files[f1].textlines.slice(b1,b2)).join("\n");
				//pos = banana.formated_block1.lastIndexOf('\n');
				//if (banana.formated_block1.length - pos == 1) {
				//	banana.formated_block1 =  banana.formated_block1+"\n";
				//}
					
				
				for (var line_i = b1; line_i < b2; line_i++ ) {
					var id = document.createElement("pre");
					id.className = one;
					var sp_m = document.createElement("span");
					sp_m.appendChild(document.createTextNode(banana.files[f1].textlines[line_i]+"\n"));
					id.appendChild(sp_m);
					banana.files[f1].ppdoc.appendChild(id);
				}
				
				/*
				var tb1 = create_block("pre",one,banana.formated_block1,aero1);
			    banana.files[f1].ppdoc.appendChild(tb1);
				 */
				

				var id = document.createElement("hr");
			    banana.files[f2].ppdoc.appendChild(id);
				/*banana.formated_block1 = "";
				for (var i = b2-b1; i > 0; i--) {
					banana.formated_block1 = banana.formated_block1 + "\n";
				}
				var tb2 = create_block("pre",two,banana.formated_block1,aero2);
			    banana.files[f2].ppdoc.appendChild(tb2);*/
			    
			    break;
			case "replace":
				var f1,f2,b1,b2,b3,b4;
				if (block[2]-block[1] > block[4]-block[3]) {
				  b1 = block[1];
				  b2 = block[2];
				  b3 = block[3];
				  b4 = block[4];
				  f1 = f1idx;
				  f2 = f2idx;
				  aero1 = 1;
				  aero2 = 2;				  
				} else {
				  b1 = block[3];
				  b2 = block[4];
				  b3 = block[1];
				  b4 = block[2];
				  f1 = f2idx;
				  f2 = f1idx;
				  aero1 = 2;
				  aero2 = 1;				  
				}
				
				banana.formated_block1 = "";
				banana.formated_block2 = "";
				for (var i = b1,j = b3;i < b2; i++ , j++) {
					banana.formated_block1 = banana.formated_block1 + banana.files[f1].textlines[i] +"\n";
					if (j >= b3 && j < b4) {
						banana.formated_block2 = banana.formated_block2 + banana.files[f2].textlines[j] +"\n";
					} else {
						/*banana.formated_block2 = banana.formated_block2 + "\n";*/
					}
				}
				var tb1 = create_block("pre","changed_part",banana.formated_block1,aero1);
			    banana.files[f1].ppdoc.appendChild(tb1);
				var tb2 = create_block("pre","changed_part",banana.formated_block2,aero2);
			    banana.files[f2].ppdoc.appendChild(tb2);
			    break;
		}
	}
}

//start comparison
function init_worker()
{
	// initialize worker
	pkt = new w_pkt();
	pkt.msgtype = "init";
	pkt.initreq = null;
	banana.compare_expert.postMessage(pkt);
}

function send_file_pkt(i,lines)
{
	pkt = new w_pkt();
	pkt.msgtype = "data";
	pkt.file.findex = i+1;
    pkt.file.lines = lines;
    banana.compare_expert.postMessage(pkt);
}

function send_to_worker(fid) {
	var chunk_size = 100000;
	var slice = new Array();
	if (fid != null) {
		get_file_slice(fid,slice,chunk_size);
		var lines = new Array();
		if (slice[0] != null) {
			lines = slice[0].split("\n");
			if (banana.files[fid].textlines)
				banana.files[fid].textlines = banana.files[fid].textlines.concat(lines);
			else
				banana.files[fid].textlines = lines;
				
		}
		else
		{
			lines = null;
		}
		send_file_pkt(fid,lines);
		return;
	}
	
	
	for(var i = 0; i < banana.total_files; i++) {
		if (banana.files[i].loaded == 0) {
			setTimeout('send_to_worker(null)',1500);
			return;
		}
		get_file_slice(i,slice,chunk_size);
		var lines = new Array();
		if (slice[0] != null)
		{
			lines = slice[0].split("\n");
			if (banana.files[i].textlines)
				banana.files[i].textlines = banana.files[i].textlines.concat(lines);
			else
				banana.files[i].textlines = lines;
		}
		else
		{
			lines = null;
		}
		send_file_pkt(i,lines);		
	}
}

function get_file_slice(fid, slice, size) {

    var buf_adjustment = 0;
    var pos            = 0;
    var i              = fid;
	var unitp          = size;
	
	if (banana.files[i].processinglength > unitp) 
	{
		slice[0] = banana.files[i].doc.value.slice(banana.files[i].sc,banana.files[i].sc+unitp);
		pos = slice[0].lastIndexOf('\n');
		if (-1 != pos)
		{
			slice[0] = slice[0].slice(0, pos);
			banana.files[i].processinglength = banana.files[i].processinglength - (pos + 1);
			banana.files[i].sc = banana.files[i].sc + pos + 1;
		}
		else
		{
		  // lines is very long so increase unitp
		  alert("This file is not supported line not fitting to unit porcessing size ");
		  return;
		}
	}
	else if (banana.files[i].processinglength != 0)
	{
		slice[0] = banana.files[i].doc.value.slice(banana.files[i].sc);
		banana.files[i].processinglength = 0;
		banana.files[i].sc = banana.files[i].doc.value.length;
	}
	else
	{
		slice[0] = null;
	}
}

function load()
{
	var r = new Array();
	var f = new Array();
	var loopid;
	var finput = document.getElementById("file_load_b");
	var i = finput.files.length;

	switch (i) {
	case 1:
		document.getElementById('progress_bar1').className='showme loading float_el size1';
		break;
	case 2:
		document.getElementById('progress_bar2').className='showme loading float_el size2';
		document.getElementById('progress_bar1').className='showme loading float_el size2';
		break;
	case 3:
		document.getElementById('progress_bar3').className='showme loading float_el size3';
		document.getElementById('progress_bar2').className='showme loading float_el size3';
		document.getElementById('progress_bar1').className='showme loading float_el size3';
		break;
	}
	

	for ( loopid = 0 ; i > 0 && banana.total_files < 3 ; i-- , loopid++ )
	{
		r[loopid] = new FileReader();
		f[loopid] = finput.files[loopid];
		switch(banana.total_files+1) {
		case 1:
			r[loopid].onload = function(e) {file_load(e,0);}
			r[loopid].onprogress = function(e) {updateProgress(document.getElementById('pgp1'),e);}
			break;
		case 2:
			r[loopid].onload = function(e) {file_load(e,1);}
			r[loopid].onprogress = function(e) {updateProgress(document.getElementById('pgp2'),e);}
			break;
		case 3:
			r[loopid].onload = function(e) {file_load(e,2);}
			r[loopid].onprogress = function(e) {updateProgress(document.getElementById('pgp3'),e);}
			break;
		}
		r[loopid].readAsText(f[loopid]);
		banana.total_files++;
	}

	
	if (banana.w_init_done == 0)
		init_worker();
	else
		send_to_worker(null);
}

function file_load (e,fid)
{
	banana.files[fid].doc.innerHTML = e.target.result;
	banana.files[fid].processinglength = banana.files[fid].doc.value.length;
	banana.files[fid].loaded = 1; 
	display_editors(banana.total_files);	
}
function display_editors(totalf) {
	switch (totalf) {
	case 1:
		banana.files[0].doc.className="editor showme size1 ";
	    document.getElementById('progress_bar1').className='hideme';
		break;
	case 2:
		if (banana.files[0].loaded == 1){banana.files[0].doc.className="editor showme size2 ";document.getElementById('progress_bar1').className='hideme';}
		if (banana.files[1].loaded == 1){banana.files[1].doc.className="editor showme size2 ";document.getElementById('progress_bar2').className='hideme';}
		break;
	case 3:
		if (banana.files[0].loaded == 1){banana.files[0].doc.className="editor showme size3 ";document.getElementById('progress_bar1').className='hideme';}
		if (banana.files[1].loaded == 1){banana.files[1].doc.className="editor showme size3 ";document.getElementById('progress_bar2').className='hideme';}
		if (banana.files[2].loaded == 1){banana.files[2].doc.className="editor showme size3 ";document.getElementById('progress_bar3').className='hideme';}
		break;
	}
}

function updateProgress(element,evt) {
	var progress = element;
    if (evt.lengthComputable) {
      var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      if (percentLoaded < 100) {
        progress.style.width = percentLoaded + '%';
        progress.textContent = "Loaded " +percentLoaded + '%';
      }
    }
}

$(document).ready(function() {
	
 	//Default Action
	$(".tab_content").hide(); //Hide all content
	$("ul.tabs li:first").addClass("active").show(); //Activate first tab
	$(".tab_content:first").show(); //Show first tab content
	
	//On Click Event
	$("ul.tabs li").click(function() {
		$("ul.tabs li").removeClass("active"); //Remove any "active" class
		$(this).addClass("active"); //Add "active" class to selected tab
		$(".tab_content").hide(); //Hide all tab content
		var activeTab = $(this).find("a").attr("href"); //Find the rel attribute value to identify the active tab + content
		$(activeTab).show(); //Fade in the active content
		return false;
	});
 
});

// Synchronized scrolling -----------------------------------------------------
function scrollsync_edit() 
{
	
	if (banana.files[0].doc && banana.files[1].doc && banana.files[2].doc)
	{
	    if(banana.files[0].doc.scrollTop!=banana.files[0].vPos) 
	    {
	        banana.files[0].vPos=banana.files[2].doc.scrollTop=banana.files[1].doc.scrollTop=banana.files[0].doc.scrollTop;
	    }
	    else if(banana.files[1].doc.scrollTop!=banana.files[1].vPos) 
	    {
	        banana.files[1].vPos=banana.files[2].doc.scrollTop=banana.files[0].doc.scrollTop=banana.files[1].doc.scrollTop;
	    }
	    else if (banana.files[2].doc.scrollTop!=banana.files[2].vPos) 
	    {
	        banana.files[2].vPos=banana.files[0].doc.scrollTop=banana.files[1].doc.scrollTop=banana.files[2].doc.scrollTop;
	    }
	}
	else if (banana.files[0].doc && banana.files[1].doc) 
	{
	    if(banana.files[0].doc.scrollTop!=banana.files[0].vPos) 
	    {
	        banana.files[0].vPos=banana.files[1].doc.scrollTop=banana.files[0].doc.scrollTop;
	    }
	    else if(banana.files[1].doc.scrollTop!=banana.files[1].vPos) 
	    {
	        banana.files[1].vPos=banana.files[0].doc.scrollTop=banana.files[1].doc.scrollTop;
	    }
	}
    setTimeout('scrollsync_edit()',1500);
    
}

function scrollsync_editpp() 
{
	
	if (banana.files[0].ppdoc && banana.files[1].ppdoc && banana.files[2].ppdoc)
	{
	    if(banana.files[0].ppdoc.scrollTop!=banana.files[0].vppPos) 
	    {
	        banana.files[0].vppPos=banana.files[2].ppdoc.scrollTop=banana.files[1].ppdoc.scrollTop=banana.files[0].ppdoc.scrollTop;
	    }
	    else if(banana.files[1].ppdoc.scrollTop!=banana.files[1].vppPos) 
	    {
	        banana.files[1].vppPos=banana.files[2].ppdoc.scrollTop=banana.files[0].ppdoc.scrollTop=banana.files[1].ppdoc.scrollTop;
	    }
	    else if (banana.files[2].ppdoc.scrollTop!=banana.files[2].vppPos) 
	    {
	        banana.files[2].vppPos=banana.files[0].ppdoc.scrollTop=banana.files[1].ppdoc.scrollTop=banana.files[2].ppdoc.scrollTop;
	    }
	}
	else if (banana.files[0].ppdoc && banana.files[1].ppdoc) 
	{
	    if(banana.files[0].ppdoc.scrollTop!=banana.files[0].vppPos) 
	    {
	        banana.files[0].vppPos=banana.files[1].ppdoc.scrollTop=banana.files[0].ppdoc.scrollTop;
	    }
	    else if(banana.files[1].ppdoc.scrollTop!=banana.files[1].vppPos) 
	    {
	        banana.files[1].vppPos=banana.files[0].ppdoc.scrollTop=banana.files[1].ppdoc.scrollTop;
	    }
	}
    setTimeout('scrollsync_editpp()',1500);
    
}

window.onload=banana_reset;
