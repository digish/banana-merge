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
        this.cmap;
        this.reverse;
	}
	this.diffresult;
	this.diffrescntr;

	this.canvas_type = function() {
		this.can;
		this.con;
        this.block;
	}
	this.canvas;
	this.ppscrollstate;
	this.color_map_calculated
}

var banana = new banana_m();

function banana_reset()
{
	
	if (window.File && window.FileReader && window.FileList) {
	} else {
		alert("This is APP uses advance file api not present on your browser!\nTry running it over firefox instead!");
	}
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
	    banana.diffresults[i].cmap = new Array();
	}
	
	banana.canvas = new Array(banana.number_of_max_files+1);
	for (var i = 0; i < banana.number_of_max_files+1 ; i++) {
		banana.canvas[i] = new banana.canvas_type();
		banana.canvas[i].can = document.getElementById('merge_can'+i);
	    banana.canvas[i].con = banana.canvas[i].can.getContext('2d');
	}
	
	banana.diffrescntr = 0;
	banana.ppscrollstate = 0;
	banana.color_map_calculated = 0;
}

function ltopx (x) {
  return (x*18);
}

function calculate_change_map() {
	
  	var total_lines1 = banana.files[0].textlines.length;
  	var total_lines2 = banana.files[1].textlines.length;
  	banana.diffresults[0].cmap = new Array();
  	
  	var offset_to_start_canvas = 16;
  	var hight_of_canvas_area = banana.canvas[0].can.offsetHeight - (3*offset_to_start_canvas);
  	if (hight_of_canvas_area <= 0 ) {
  		return;
  	}
  	else
  	{
  		banana.color_map_calculated = 1;  		
  	}
	for (var midx in banana.diffresults[0].diff.output ) {
		var mblock = banana.diffresults[0].diff.output[midx];
		var block_color1;
		var block_color2;
		switch (mblock[0]) {
		default:
		case "equal":
			continue;
		case "insert":
			block_color1 = 'red';
			block_color2 = 'MediumSeaGreen';
			break;
		case "delete":
			block_color1 = 'SkyBlue';
			block_color2 = 'red';
			break;
		case "replace":
			block_color1 = 'GoldenRod';
			block_color2 = 'GoldenRod';
			break;
		}
	    var block_start_percent_pos = (mblock[1]*100)/total_lines1;
	    var block_percent_height = ((mblock[2]-mblock[1])* 100) / total_lines1;
	    var block_actual_start1 = (block_start_percent_pos * hight_of_canvas_area / 100 ) + offset_to_start_canvas;
	    var block_actual_height1 = block_percent_height * hight_of_canvas_area / 100;
	    if (!block_actual_height1) {
	    	block_actual_height1 = 2;
	    }
	    block_start_percent_pos = (mblock[3]*100)/total_lines2;
	    block_percent_height = ((mblock[4]-mblock[3])* 100) / total_lines2;
	    var block_actual_start2 = (block_start_percent_pos * hight_of_canvas_area / 100 ) + offset_to_start_canvas;
	    var block_actual_height2 = block_percent_height * hight_of_canvas_area / 100;
	    if (!block_actual_height2) {
	    	block_actual_height2 = 2;
	    }
	    banana.diffresults[0].cmap.push([block_color1,block_actual_start1,block_actual_height1,block_actual_start2,block_actual_height2,block_color2]);
	}
}
function draw_change_map(reverse) {
	if (banana.color_map_calculated == 0) {
		calculate_change_map();
	}
	
	var A1 = 1;
	var A2 = 2;
	var B1 = 3;
	var B2 = 4;
	var A = 1;
	var B = 2;
	
	if (reverse) {
	A1 = 3;
	A2 = 4;
	B1 = 1;
	B2 = 2;
	A = 2;
	B = 1;
	}
	
	
	var context1 = banana.canvas[1].con;
	var context2 = banana.canvas[3].con;
	var x1_offset = 0;
	var x2_offset = 0;
    var width1 = 20;
    var width2 = 100;
	for (var midx in banana.diffresults[0].cmap) {
		mblock = banana.diffresults[0].cmap[midx];
		context1.fillStyle = mblock[0];
		context1.fillRect(x1_offset, mblock[A1],width1,mblock[A2]);
		context2.fillStyle = mblock[5];
		context2.fillRect(x2_offset, mblock[B1],width2,mblock[B2]);
	}
}
function draw_block(type,canid,sA,eA,sB,eB,cl) {
	//var current_height = document.getElementById("merge_can1").offsetHeight;
    var block_deep = 10;
    var context = banana.canvas[canid].con;
    var width = 50;
    var overshoot = 3;
    
    
    
    context.lineWidth = 2;
    context.beginPath();
	context.strokeStyle = cl;
    
    if (type == "one") {
    if (eA != 0) {
    	eA++;
        context.moveTo(0,ltopx(sA));
        context.lineTo(block_deep,ltopx(sA));
        context.lineTo(block_deep,ltopx(eA)+overshoot);
        context.lineTo(0,ltopx(eA)+overshoot);
        context.moveTo(block_deep,ltopx(sA+((eA-sA)/2)));
    	}
    	else
    	{
    		context.moveTo(0,ltopx(sA));
    	}
    	
    	
    	if (eB != 0) {
    		eB++;
    		context.lineTo(width-block_deep,ltopx(sB+((eB-sB)/2)));
    		
    		context.moveTo(width,ltopx(sB));
    		context.lineTo(width-block_deep,ltopx(sB));
    		context.lineTo(width-block_deep,ltopx(eB)+overshoot);
    		context.lineTo(width,ltopx(eB)+overshoot);
    	}
    	else
    	{
    		context.lineTo(width,ltopx(sB));
    	}
    } else if (type == "two") {
    	context.fillStyle = cl;
    	context.shadowColor   = 'rgba(0, 0, 0, 0.5)';
    	context.shadowOffsetX = 5;
    	context.shadowOffsetY = 5;
    	context.shadowBlur    = 4;
    	if (eA == 0) {
    		eB++;
    		
    		context.moveTo(0,ltopx(sA));
    		context.lineTo(block_deep,ltopx(sA));
    		context.lineTo(width-block_deep,ltopx(sB));
    		context.lineTo(width+1,ltopx(sB));
    		context.lineTo(width+1,ltopx(eB));
    		context.lineTo(width-block_deep,ltopx(eB));
    		context.lineTo(block_deep,ltopx(sA));
    		/*
    		context.moveTo(0,ltopx(sA));
    		context.lineTo(block_deep,ltopx(sA));
    		context.lineTo(width-block_deep,ltopx(sB));
    		context.lineTo(width,ltopx(sB));
    		context.moveTo(0,ltopx(sA));
    		context.lineTo(block_deep,ltopx(sA));
    		context.lineTo(width-block_deep,ltopx(eB)+overshoot);
    		context.moveTo(width-block_deep,ltopx(eB)+overshoot);        
    		context.lineTo(width,ltopx(eB)+overshoot);
    		*/
        	context.globalAlpha = 0.3;
    		context.fill();
        	context.globalAlpha = 1;
    	} else if (eB == 0) {
    		eA++;
    		
    		context.moveTo(width,ltopx(sB));
    		context.lineTo(width-block_deep,ltopx(sB));
    		context.lineTo(block_deep,ltopx(sA));
    		context.lineTo(-1,ltopx(sA));
    		context.lineTo(-1,ltopx(eA));
    		context.lineTo(block_deep,ltopx(eA));
    		context.lineTo(width-block_deep,ltopx(sB));
    		/*
    		context.moveTo(0,ltopx(sA));
    		context.lineTo(block_deep,ltopx(sA));
    		context.lineTo(width-block_deep,ltopx(sB));
    		context.lineTo(width,ltopx(sB));
    		context.moveTo(0,ltopx(eA)+overshoot);
    		context.lineTo(block_deep,ltopx(eA)+overshoot);
    		context.lineTo(width-block_deep,ltopx(sB));
    		context.moveTo(width-block_deep,ltopx(sB));        
    		context.lineTo(width,ltopx(sB));
    		*/
        	context.globalAlpha = 0.3;
    		context.fill();
        	context.globalAlpha = 1;
    	} else {
    		eA++;
    		eB++;
    		context.moveTo(-1,ltopx(sA));
    		context.lineTo(block_deep,ltopx(sA));
    		context.lineTo(width-block_deep,ltopx(sB));
    		context.lineTo(width+1,ltopx(sB));
    		context.lineTo(width+1,ltopx(eB));
    		context.lineTo(width-block_deep,ltopx(eB));
    		context.lineTo(block_deep,ltopx(eA));
    		context.lineTo(-1,ltopx(eA));
    		context.lineTo(-1,ltopx(sA));
        	context.globalAlpha = 0.3;
    		context.fill();
        	context.globalAlpha = 1;
    	}
    }
    
    
    context.closePath();
    context.stroke(); 
}

function refresh_can(id) {
	
	if (!banana.canvas || !banana.files[0] ){
		return;
	}
	
	var c_height = banana.canvas[0].can.offsetHeight;
	banana.canvas[0].can.setAttribute('width', '50');
	banana.canvas[0].can.setAttribute('height', c_height);
	banana.canvas[1].can.setAttribute('width', '50');
	banana.canvas[1].can.setAttribute('height', c_height);
	banana.canvas[2].can.setAttribute('width', '50');
	banana.canvas[2].can.setAttribute('height', c_height);
	banana.canvas[3].can.setAttribute('width', '50');
	banana.canvas[3].can.setAttribute('height', c_height);
	
	var f1idx = 0;
	var f2idx = 1;
    var A1   = 1;
    var A2   = 2;
    var B1   = 3;
    var B2   = 4;
    var A    = 1;
    var B    = 2;	
	
	if (banana.diffresults[0].reverse) {
	    A1   = 3;
	    A2   = 4;
	    B1   = 1;
	    B2   = 2;
	    A    = 2;
	    B    = 1;
	} 
	
	// derive for file-1 the visible first line and end line
	var f1f = banana.files[f1idx].vppPos / ltopx(1);
    var f1l = f1f + (banana.canvas[0].can.offsetHeight / ltopx(1));
    var cent1 = f1f + ((f1l-f1f)/2);
    
	var f2f = banana.files[f2idx].vppPos / ltopx(1);
    var f2l = f2f + (banana.canvas[0].can.offsetHeight / ltopx(1));
    var cent2 = f2f + ((f2l-f2f)/2);
    
    var l1,l2,l3,l4;
	banana.ppscrollstate = !banana.ppscrollstate;
    // draw change map
    draw_change_map(banana.diffresults[0].reverse);
    
	for (var midx in banana.diffresults[0].diff.output ) {
		mblock = banana.diffresults[0].diff.output[midx];
		if (((mblock[A2] >= f1f) && (mblock[A1] < f1l)) || ((mblock[B2] >= f2f) && (mblock[B1] < f2l)) ) {
		
    		if (!banana.ppscrollstate) {
				if (id == 0) {
					/* adjust second file according to it */
			        if ((mblock[A2] >= cent1) && (mblock[A1] <= cent1)) {
			        	// this is the center block
			        	banana.files[f2idx].ppdoc.scrollTop = ltopx(mblock[B1]) - (ltopx(mblock[A1]) - banana.files[f1idx].vppPos);
			        	
			        }
				} else if (id == 1) {
					/* adjust first file according to it */
			        if ((mblock[B2] >= cent2) && (mblock[B1] <= cent2)) {
			        	// this is the center block
			        	banana.files[f1idx].ppdoc.scrollTop = ltopx(mblock[A1]) - (ltopx(mblock[B1]) - banana.files[f2idx].vppPos);
			        }
				}
    		}
			
			if (mblock[0] != "equal") {
				l1 =  mblock[A1] - f1f;
				l2 =  mblock[A2] - f1f;
				l3 =  mblock[B1] - f2f;
				l4 =  mblock[B2] - f2f;
		 		if (l1 == l2) {
		 			l2 = 1;
		 		}
		 		if (l3 == l4) {
		 			l4 = 1;
		 		}
		 		draw_block("two",1,l1,l2-1,l3,l4-1,mblock[5]);
			}
		}
	}
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
            banana.files[0].doc.className="hideme";
            banana.files[1].doc.className="hideme";
	    	
//            banana.files[0].ppdoc.className="editor_pp showme size2 ";
//            banana.files[1].ppdoc.className="editor_pp showme size2 b_adjust";
            banana.canvas[0].can.className="canvas_class_cmap";
            banana.canvas[1].can.className="canvas_class";
            banana.canvas[3].can.className="canvas_class_cmap b_adjust";
            calculate_change_map();
	        break;
	    case 3:
            banana.files[0].doc.className="hideme";
            banana.files[1].doc.className="hideme";
            banana.files[2].doc.className="hideme";
            
            banana.files[0].ppdoc.className="editor_pp showme size3 ";
            banana.files[1].ppdoc.className="editor_pp showme size3 "; 
            banana.files[2].ppdoc.className="editor_pp showme size3 ";
            banana.canvas[0].can.className="canvas_class_cmap";
            banana.canvas[1].can.className="canvas_class";
            banana.canvas[2].can.className="canvas_class";
            banana.canvas[3].can.className="canvas_class_cmap";
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
function cancel(event) {
 if (event.preventDefault) {
   event.preventDefault();
 }
 return false;
}

function swap_ed(id) {
	
	banana.diffresults[id].reverse = !banana.diffresults[id].reverse;
	banana.files[id].ppdoc.innerHTML = "";
	banana.files[id+1].ppdoc.innerHTML = "";
	show_diff();
	refresh_can(id);
}

function show_diff() {
	var f1idx = 0;
	var f2idx = 1;
	var f1ridx = 0;
	var f2ridx = 1;
    var A1   = 1;
    var A2   = 2;
    var B1   = 3;
    var B2   = 4;
    var A    = 1;
    var B    = 2;
    
    
	var match_result =  banana.diffresults[0].diff.output;
	if (banana.diffrescntr > 1) {
		var match_result2 =  banana.diffresults[1].diff.output;
//		combine_diff_result(match_result,match_result2);
	}
	
	if (banana.diffresults[0].reverse) {
		f1ridx = 1;
		f2ridx = 0;
	    A1   = 3;
	    A2   = 4;
	    B1   = 1;
	    B2   = 2;
	    A    = 2;
	    B    = 1;
	}
	
	
	
	for (var idx in match_result) {
		var block = match_result[idx];
		switch(block[0]) {
			case "equal":
				var b1 = block[A1];
				var b2 = block[A2];
				
				for (var line_i = b1; line_i < b2; line_i++ ) {
					var id = document.createElement("pre");
					id.className = "add_normalline unmodifed_line";
					id.id = "F"+A+"-"+line_i;
					var sp_m = document.createElement("span");
					sp_m.appendChild(document.createTextNode(banana.files[f1ridx].textlines[line_i]+"\n"));
					id.appendChild(sp_m);
					banana.files[f1idx].ppdoc.appendChild(id);
				}
				
				b1 = block[B1];
				b2 = block[B2];				
				for (var line_i = b1; line_i < b2; line_i++ ) {
					var id = document.createElement("pre");
					id.className = "add_normalline unmodifed_line";
					id.id = "F"+B+"-"+line_i;
					var sp_m = document.createElement("span");
					sp_m.appendChild(document.createTextNode(banana.files[f2ridx].textlines[line_i]+"\n"));
					id.appendChild(sp_m);
					banana.files[f2idx].ppdoc.appendChild(id);
				}
				block.push('white');
				break;
			case "insert":	
			case "delete":
				var one,two,b1,b2,b3,b4,f1,f2;
				if (block[B2] - block[B1] == 0) {
					formate = "add_modified_left_b modified_left_line";
					b1 = block[A1];
					b2 = block[A2];
					f1 = f1idx;
					f2 = f2idx;
					f1r = f1ridx;
					f2r = f2ridx;
					aero1 = A;
					aero2 = B;
					ul_l = document.getElementById("F"+B+"-"+(block[B1]-1));
					
					block.push('SkyBlue');
				} else {
					formate = "add_modified_right_b modified_right_line";
					f1 = f2idx;
					f2 = f1idx;
					f1r = f2ridx;
					f2r = f1ridx;
					b1 = block[B1];
					b2 = block[B2];
					aero1 = B;
					aero2 = A;
					
					ul_l = document.getElementById("F"+A+"-"+(block[A1]-1));
					block.push('MediumSeaGreen');
				}
				
				if (ul_l) {
					ul_l.className = ul_l.className + " add_missingline_b add_box_shadao";
					ul_l.setAttribute('draggable', 'true');
					ul_l.addEventListener('dragover', cancel, false);
					ul_l.addEventListener('dragenter', cancel, false);
					ul_l.addEventListener('drop',function (event) {
						  if (event.preventDefault) {
							    event.preventDefault();
							  }
							  //this.innerHTML += '<p>' + event.dataTransfer.getData('Text') + '</p>';
						      return false;
							}, false);
					
				}
				
				var blk = document.createElement("p");
				blk.id = "blk"+"-"+idx;
				for (var line_i = b1; line_i < b2; line_i++ ) {
					var id = document.createElement("pre");
					id.className = formate;
					id.id = "F"+aero1+"-"+line_i;
					var sp_m = document.createElement("span");
					sp_m.appendChild(document.createTextNode(banana.files[f1r].textlines[line_i]+"\n"));
					id.appendChild(sp_m);
					blk.appendChild(id);
				}
				blk.setAttribute('draggable', 'true');
				blk.addEventListener('dragstart', function (e) {
				      e.dataTransfer.effectAllowed = 'copy'; 
				      e.dataTransfer.setData('Text', this.id); 
				    }, false);

				banana.files[f1].ppdoc.appendChild(blk);
				
				ul_l = document.getElementById("F"+aero1+"-"+b1);
				if (ul_l) {
					ul_l.className = ul_l.className + " add_blockupperline"; 
				}
				
				ul_l = document.getElementById("F"+aero1+"-"+(b2-1));
				if (ul_l) {
					ul_l.className = ul_l.className + " add_blockbottomline add_box_shadao"; 
				}
				
				
			    break;
			    
			case "replace":
				var b1 = block[A1];
				var b2 = block[A2];				
				for (var line_i = b1; line_i < b2; line_i++ ) {
					var id = document.createElement("pre");
					id.className = "add_changed_b changed_part";
					id.id = "F1-"+line_i;
					var sp_m = document.createElement("span");
					sp_m.appendChild(document.createTextNode(banana.files[f1ridx].textlines[line_i]+"\n"));
					id.appendChild(sp_m);
					banana.files[f1idx].ppdoc.appendChild(id);
				}
				
				ul_l = document.getElementById("F"+A+"-"+b1);
				if (ul_l) {
					ul_l.className = ul_l.className + " add_blockupperline"; 
				}
				
				ul_l = document.getElementById("F"+A+"-"+(b2-1));
				if (ul_l) {
					ul_l.className = ul_l.className + " add_blockbottomline add_box_shadao"; 
				}
				
				var b1 = block[B1];
				var b2 = block[B2];				
				for (var line_i = b1; line_i < b2; line_i++ ) {
					var id = document.createElement("pre");
					id.className = "add_changed_b changed_part";
					id.id = "F"+B+"-"+line_i;
					var sp_m = document.createElement("span");
					sp_m.appendChild(document.createTextNode(banana.files[f2ridx].textlines[line_i]+"\n"));
					id.appendChild(sp_m);
					banana.files[f2idx].ppdoc.appendChild(id);
				}
				
				ul_l = document.getElementById("F"+B+"-"+b1);
				if (ul_l) {
					ul_l.className = ul_l.className + " add_blockupperline"; 
				}
				
				ul_l = document.getElementById("F"+B+"-"+(b2-1));
				if (ul_l) {
					ul_l.className = ul_l.className + " add_blockbottomline add_box_shadao"; 
				}
				
				block.push('GoldenRod');
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
			r[loopid].onprogress = function(e) {/*file_load(e,0);*/updateProgress(document.getElementById('pgp1'),e);}
			break;
		case 2:
			r[loopid].onload = function(e) {file_load(e,1);}
			r[loopid].onprogress = function(e) {/*file_load(e,1);*/updateProgress(document.getElementById('pgp2'),e);}
			break;
		case 3:
			r[loopid].onload = function(e) {file_load(e,2);}
			r[loopid].onprogress = function(e) {/*file_load(e,2);*/updateProgress(document.getElementById('pgp3'),e);}
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
/*
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
*/
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

function scrollsync_editpp(id) 
{
	if (banana.files[0].ppdoc && banana.files[1].ppdoc && banana.files[2].ppdoc)
	{
	    if(banana.files[0].ppdoc.scrollTop!=banana.files[0].vppPos) 
	    {
	        banana.files[0].vppPos=banana.files[2].ppdoc.scrollTop=banana.files[0].ppdoc.scrollTop;
	        //banana.files[1].ppdoc.scrollTop=
	        refresh_can(0);
	    }
	    else if(banana.files[1].ppdoc.scrollTop!=banana.files[1].vppPos) 
	    {
	        banana.files[1].vppPos=banana.files[2].ppdoc.scrollTop=banana.files[1].ppdoc.scrollTop;
	        //banana.files[0].ppdoc.scrollTop=
	        refresh_can(1);
	    }
	    else if (banana.files[2].ppdoc.scrollTop!=banana.files[2].vppPos) 
	    {
	        banana.files[2].vppPos=banana.files[0].ppdoc.scrollTop=banana.files[1].ppdoc.scrollTop=banana.files[2].ppdoc.scrollTop;
	    }
	}
	
	setTimeout('scrollsync_editpp()',1500);	
}

window.onload=banana_reset;
window.onresize=refresh_can;
window.onresize=function(){banana.color_map_calculated = 0;};