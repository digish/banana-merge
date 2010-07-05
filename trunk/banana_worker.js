//banana_worker.js
var results = [];  
var bufa = "";
var bufb = "";
var buf1 = new Array();
var buf2 = new Array();
var more_line = 0;
var w_ffile_over = 0;
var w_sfile_over = 0;

function worker_result() {
	this.Astatus = new Array();
	this.Bstatus = new Array();
	this.Alines_processed;
	this.Blines_processed;
	this.reversed;
	this.msg;
	this.msglog;
	this.buf1 = new Array();
	this.buf2 = new Array();
}
var result_status = new worker_result;

function w_send_debug(dms)
{
	result_status.msg = "debug";
	result_status.msglog = dms;
	postMessage(result_status);
	
}

function onmessage(event) {  

	var snippet = new Array();

	snippet =  event.data.split("*#magic#*");
	switch(snippet[0]){
	case "init":
		result_status.Alines_processed = 0;
		result_status.Blines_processed = 0;
		result_status.reversed = 0;
		result_status.msg="init_done";
		postMessage(result_status);
		
		w_send_debug("Initialization done");
		
		
		return;
	case "all":

		if (snippet[1].length > 0) {
			bufa = bufa+snippet[1];
			w_send_debug("Data arrived in first buffer:\n"+snippet[1]);
			
		}
		else
		{
			w_ffile_over = 1;
		}

		if (snippet[2].length > 0) {
			bufb = bufb+snippet[2];
			w_send_debug("Data arrived in second buffer:\n"+snippet[2]);
			
		}
		else
		{
			w_sfile_over = 1;
		}


		break;
	case "first":
		if (snippet[1].length > 0) {
			bufa = bufa+snippet[1];
			w_send_debug("Data arrived in first buffer:\n"+snippet[1]);
			
		}
		else
		{
			w_ffile_over = 1;
		}

		break;
	case "second":
		if (snippet[1].length > 0) {
			bufb = bufb+snippet[1].split("\n");
			w_send_debug("Data arrived in second buffer:\n"+snippet[1]);
			
		}
		else
		{
			w_sfile_over = 1;
		}
		break;
	default:
		return;
	}

	w_compare();
}

function w_compare(){

	var i = 0;
	var j = 0;
	var k = 0;

	w_send_debug("starting comparision");

	var matched=0;
	var s1 = new Array();
	var s2 = new Array();
	var left="l";
	var right="r";
	buf1 = bufa.split("\n");
	buf2 = bufb.split("\n");
	/*
	 if (buf1.length < buf2.length)
	 {
		 i = buf1;
		 buf1 = buf2;
		 buf2 = i;

		 left="r";
		 right="l";

		 result_status.reversed = 1;
        result_status.msg = "debug";
        result_status.msglog = "buffer reversed";
        postMessage(result_status);
	 }
	 else
	 {
		 result_status.reversed = 0;
	 }

	 */

	w_send_debug("line A:"+result_status.Alines_processed+" line B:"+result_status.Blines_processed);
	
	k = result_status.Blines_processed;

	for (i=result_status.Alines_processed; i < buf1.length; i++)
	{
		j=k;
		if (j >= buf2.length) 
		{
			if (w_sfile_over == 1) 
			{
				w_send_debug("j:"+j+"line is falling short in buf2 so one blank requred at end");
				
	//			buf2 = buf2.concat("");
				if (result_status.Bstatus[j]) {
					result_status.Bstatus[j] =result_status.Bstatus[j]+"*a"+left+"*b"; // Added for left
				} else {
					result_status.Bstatus[j] ="a"+left+"*b"; // Added for left
				}
				result_status.Astatus[i] = "m"+right; // missing in right
				result_status.Bstatus[j] =result_status.Bstatus[j]+"*a"+left+"*b"; // Added for left
				w_send_debug("result_status.Astatus[i:"+i+"]:"+result_status.Astatus[i]);
				w_send_debug("result_status.Bstatus[j:"+j+"]:"+result_status.Bstatus[j]);
				j++;
				continue;
			}
			else
			{
				w_send_debug("j:"+j+"line is falling short in buf2 request more data");
				break;
			}
		}

		
		// check if we are on last line of buf1 and data is pending from main thread 
		// than do comparison after fetching next data
		if (i == buf1.length-1 && w_ffile_over != 1) 
		{
			w_send_debug("i:"+i+" buf1 length:"+buf1.length+" so line may be incomplete get next data first");
			break;
		}

		for ( ; j < buf2.length; j++)
		{

			w_send_debug("buf1["+i+"] "+buf1[i]+ " buf2["+j+"]"+buf2[j]);
			

			if (buf1[i] == buf2[j]) {
				w_send_debug(" matched buf1["+i+"] "+buf1[i]+ " buf2["+j+"]"+buf2[j]);

				matched = 1;
				if (i != j)
				{
					p = j-i;
					for (; p > 0 ; p-- )
					{
						
//						var slice_pre;
//						var slice_post;
//						slice_pre  = buf1.slice(0,i);
//						slice_post = buf1.slice(i,buf1.length);
//						buf1.orig = slice_pre.concat("",slice_post);
						if (result_status.Astatus[i]) {
							result_status.Astatus[i]=result_status.Astatus[i]+"*a"+right+"*b"; // Added for right
						} else {
							result_status.Astatus[i]="a"+right+"*b"; // Added for right
						}
						result_status.Astatus[i]=result_status.Astatus[i]+"*a"+right+"*b"; // Added for right
						result_status.Bstatus[j]="m"+left; // Missing in left
						w_send_debug("result_status.Astatus[i:"+i+"]:"+result_status.Astatus[i]);
						w_send_debug("result_status.Bstatus[j:"+j+"]:"+result_status.Bstatus[j]);
						
						w_send_debug("Adj j-i:"+p+"i:"+i);
						i++;
					}

				}
				k=j+1;


				result_status.Astatus[i] = "n"+right;  // normal with right
				result_status.Bstatus[j] = "n"+left; // normal with left
				w_send_debug("result_status.Astatus[i:"+i+"]:"+result_status.Astatus[i]);
				w_send_debug("result_status.Bstatus[j:"+j+"]:"+result_status.Bstatus[j]);

				w_send_debug(" adjusted buf1["+i+"] "+buf1[i]+ " buf2["+j+"]"+buf2[j]);
				w_send_debug("normal match");

				break;
			}
			else if (1 == w_match_percentage(buf1[i],buf2[j],s1,s2))
			{

				w_send_debug(" partial match buf1["+i+"] "+buf1[i]+ " buf2["+j+"]"+buf2[j]);
				
				matched = 1;
				if (i != j)
				{
					p = j-i;
					for (; p > 0 ; p-- )
					{
//						var slice_pre;
//						var slice_post;
//						slice_pre  = buf1.slice(0,i);
//						slice_post = buf1.slice(i,buf1.length);
//						buf1 = slice_pre.concat("",slice_post);
						if (result_status.Astatus[i]) {
							result_status.Astatus[i]=result_status.Astatus[i]+"*a"+right+"*b"; // Added for right
						} else {
							result_status.Astatus[i]="a"+right+"*b"; // Added for right
						}
						
						result_status.Astatus[i]=result_status.Astatus[i]+"*a"+right+"*b"; // Added for right
						result_status.Bstatus[j]="m"+left; // Missing in left
						w_send_debug("result_status.Astatus[i:"+i+"]:"+result_status.Astatus[i]);
						w_send_debug("result_status.Bstatus[j:"+j+"]:"+result_status.Bstatus[j]);
						
						w_send_debug("Adj j-i:"+p+"i:"+i);
						
						i++;
					}
				}
				k=j+1;
				
				w_send_debug(" adjusted buf1["+i+"] "+buf1[i]+ " buf2["+j+"]"+buf2[j]);
				w_send_debug("partial match");
				
				result_status.Astatus[i]=s1; // partial match right
				result_status.Bstatus[j]=s2; // partial match left
				w_send_debug("result_status.Astatus[i:"+i+"]:"+result_status.Astatus[i]);
				w_send_debug("result_status.Bstatus[j:"+j+"]:"+result_status.Bstatus[j]);
				
				s1 = new Array();
				s2 = new Array();
				break;
			}
		}
		
		result_status.Alines_processed = i+1;			
		
		if (matched == 1) 
		{
			matched = 0;
		}
		else
		{
			w_send_debug("not matched so add one line to right");
			
//			var slice_pre;
//			var slice_post;
//			slice_pre  = buf2.slice(0,i);
//			slice_post = buf2.slice(i,buf2.length);
//			buf2 = slice_pre.concat("",slice_post);
			result_status.Astatus[i]="m"+right; // Missing in right
			if (result_status.Bstatus[k-1]) {
				result_status.Bstatus[k-1]=result_status.Bstatus[k-1]+"*a"+left+"*b"; // Added for left
			} else {
				result_status.Bstatus[k-1]="a"+left+"*b"; // Added for left
			}
			w_send_debug("result_status.Astatus[i:"+i+"]:"+result_status.Astatus[i]);
			w_send_debug("result_status.Bstatus[k-1:"+(k-1)+"]:"+result_status.Bstatus[k-1]);
		}
	}

	result_status.Blines_processed = k;

	if ((w_ffile_over == 0) && (w_sfile_over == 0)) {
		w_send_debug("requesting data from both files");
		
		result_status.msg="all";
	}
	else if (w_ffile_over == 0) {
		w_send_debug("requesting data from first file");
		
		result_status.msg="first";
	}
	else if (w_sfile_over == 0)
	{
		w_send_debug("requesting data from second file");
		
		result_status.msg="second";
	}
	else
	{
		w_send_debug("bothfile over and so comparison over");
		
		
		result_status.msg="done";
	}
	result_status.buf1 = buf1;
	result_status.buf2 = buf2;

	postMessage(result_status);
}

function w_match_percentage(l1,l2,s1,s2) {
	lw1 = l1.split(" ");
	lw2 = l2.split(" ");

	var total_match = 0;
	var percentage = 0;

	var i,j,k;
	k = 0;

	for (i=0 ; i < lw1.length ; i++ ) {
		for (j=k; j < lw2.length ; j++) {
			if (lw1[i] == lw2[j]) {
				total_match++;
				s1[i]="m"
				s2[j]="m"
					k=j+1;
				break;
			}
		}
	}

	percentage = 100*total_match/lw1.length;
	if (percentage >= 30)
	{
		return 1;
	}
	else
	{
		return 0;
	}
}


