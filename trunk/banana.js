var banana_timer = window.setTimeout('activity_tracker()',1000);
var banana_state = "NOT_EATING";
var banana_basket = new Array;

var used_banana = 0;
var banana_total;
function banana()
{
  this.orig                 = new Array();
  this.formated             = new Array();
  this.status               = new Array();
  this.awin;
  this.bwin;
  
  this.ChangeDisp=ChangeDisp;
  this.ChangeSize=ChangeSize;
}
function ChangeSize(factor)
{
  switch(factor)
  {
  case 1:
    this.awin.style.width = '100%';
    this.bwin.style.width = '100%';
  break;
  case 2:
    this.awin.style.width = '49%';
    this.bwin.style.width = '49%';
  break;
  case 3:
    this.awin.style.width = '32%';
    this.bwin.style.width = '32%';
  break;
  default:
  break;
  }
}
function ChangeDisp(screen,cmd)
{
  if (cmd == "on") {
    if (screen=="a") {
      this.awin.style.display = 'block';
    }
    else if (screen=="b") {
      this.bwin.style.display = 'block';
    }
  } else {
    if (screen=="a") {
      this.awin.style.display = 'none';
    }
    else if (screen=="b") {
      this.bwin.style.display = 'none';
    }
  }
  return;
}

function activity_tracker() {

    switch(banana_state) 
    {
     case "NOT_EATING":
          break;
     case "OPENING":
          open_banana();
          break;
     case "EATING":
          eat_banana_bite();
          break;
     case "ENJOYING":
          enjoy_banana_bite();
          break;
     case "THROW_AWAY":
          window.clearTimeout(banana_timer);
          break;
     break; 
    }
}

function open_banana()
{
  while (used_banana < banana_total)
  {
    banana_basket[used_banana] = new banana();
    banana_basket[used_banana].awin = document.getElementById('editor'+used_banana);
    banana_basket[used_banana].bwin = document.getElementById('editor_pp1'+used_banana);
    banana_basket[used_banana].orig =  banana_basket[used_banana].ewin.value.split('\n');
    used_banana++;
  }
}
function eat_banana_bite()
{
  if (banana_total < 2) {
    return;
  }
  
}
function enjoy_banana_bite()
{

}

function reset_stuff()
{
  document.getElementById("file_load_b").value = "";
}

function compare2() {
  files[0]      =   new cfile;
  files[1]      =   new cfile;
  files[0].orig =  (document.getElementById('editor1').value).split('\n');
  files[1].orig =  (document.getElementById('editor2').value).split('\n');
  
  var i;
  var j;
  var k = 0;
  var p = 0;
  var matched=0;
  var left="l";
  var right="r";
  
  var ppl = document.getElementById('editor_pp1');
  var ppr = document.getElementById('editor_pp2');
  ppl.style.width = '49%';
  ppr.style.width = '49%';
  
  var s1 = new Array();
  var s2 = new Array();
  
  if (files[0].orig.length < files[1].orig.length)
    {
      i = files[0];
      files[0] = files[1];
      files[1] = i;
      i = ppl;
      ppl = ppr;
      ppr = i;
      
      left="r";
      right="l";
      
    }
  
  for (i=0; i < files[0].orig.length; i++)
    {
      j=k;
      if (j >= files[1].orig.length) 
    {
      files[1].orig = files[1].orig.concat("");
      files[1].status[i] = "a"+left; // Added for left
      files[0].status[i] = "m"+right; // missing in right
      j++;
      continue;
    }
      
      for ( ; j < files[1].orig.length; j++)
    {
      if (files[0].orig[i] == files[1].orig[j]) {
                        
        matched = 1;
        
        if (i != j)
          {
        
        p = j-i;
        for (; p > 0 ; p-- )
          {
            var slice_pre;
            var slice_post;
            slice_pre  = files[0].orig.slice(0,i);
            slice_post = files[0].orig.slice(i,files[0].orig.length);
            files[0].orig = slice_pre.concat("",slice_post);
            files[0].status[i]="a"+right; // Added for right
            files[1].status[i]="m"+left; // Missing in left
            i++;
          }
        
          }
        k=j+1;
        
        files[0].status[i] = "n"+right;  // normal with right
        files[1].status[i] = "n"+left; // normal with left
        
        break;
      }
      else if (1 == match_percentage(files[0].orig[i],files[1].orig[j],s1,s2))
        {
          matched = 1;
          
          if (i != j)
        {
          p = j-i;
          for (; p > 0 ; p-- )
            {
              var slice_pre;
              var slice_post;
              slice_pre  = files[0].orig.slice(0,i);
              slice_post = files[0].orig.slice(i,files[0].orig.length);
              files[0].orig = slice_pre.concat("",slice_post);
              files[0].status[i]="a"+right; // Added for right
              files[1].status[i]="m"+left; // Missing in left
              i++;
            }
          
        }
          k=j+1;
          //files[0].status[i]="partm"+right; // partial match right
          //files[1].status[i]="partm"+left; // partial match left
          files[0].status[i]=s1; // partial match right
          files[1].status[i]=s2; // partial match left
          s1 = new Array();
          s2 = new Array();
          break;
        }
      
    }
      
      if (matched == 1) 
    {
      matched = 0;
    }
      else
    {
      var slice_pre;
      var slice_post;
      slice_pre  = files[1].orig.slice(0,i);
      slice_post = files[1].orig.slice(i,files[1].orig.length);
      files[1].orig = slice_pre.concat("",slice_post);
      files[1].status[i]="a"+left; // Added for left
      files[0].status[i]="m"+right; // Missing in right
      k++;
    }
    }
  
  ppl.innerHTML = "";
  ppr.innerHTML = "";
  
  formated_print(ppl,ppr,files[0],files[1]);
  
  document.getElementById('editor1').style.display = 'none';
  document.getElementById('editor2').style.display = 'none';
  document.getElementById('editor3').style.display = 'none';
  document.getElementById('editor_pp1').style.display = 'block';
  document.getElementById('editor_pp2').style.display = 'block';
  //          document.getElementById('editor_pp3').style.display = 'block';
}



var total_files = 0;
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
	r[loopid].onload = function(e) { ed[0].innerHTML = e.target.result; ed[0].style.display = 'block'; }
	break;
      case 2:
	r[loopid].onload = function(e) { ed[1].innerHTML = e.target.result; ed[1].style.display = 'block'; }
	ed[0].style.width = '49%';
	ed[1].style.width = '49%';
	break;
      case 3:
	r[loopid].onload = function(e) { ed[2].innerHTML = e.target.result; ed[2].style.display = 'block';  }
	ed[0].style.width = '32%';
	ed[1].style.width = '32%';
	ed[2].style.width = '32%';
	break;
      }
      r[loopid].readAsText(f[loopid]);
      total_files++;
    }
  
  if (total_files > 1)
    {
      document.getElementById("compare").className = "button";
      
    }
  if (total_files > 0)
    {
      document.getElementById("top_section").className = "top_space_time2"; 
    }
  
}

function format(c) { document.execCommand(c, false, false); }


function cfile() {
  this.orig                 = new Array();
  this.formated             = new Array();
  this.status               = new Array();
}

var files = new Array();

function match_percentage(l1,l2,s1,s2) {
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


function compare2() {
  files[0]      =   new cfile;
  files[1]      =   new cfile;
  files[0].orig =  (document.getElementById('editor1').value).split('\n');
  files[1].orig =  (document.getElementById('editor2').value).split('\n');
  
  var i;
  var j;
  var k = 0;
  var p = 0;
  var matched=0;
  var left="l";
  var right="r";
  
  var ppl = document.getElementById('editor_pp1');
  var ppr = document.getElementById('editor_pp2');
  ppl.style.width = '49%';
  ppr.style.width = '49%';
  
  var s1 = new Array();
  var s2 = new Array();
  
  if (files[0].orig.length < files[1].orig.length)
    {
      i = files[0];
      files[0] = files[1];
      files[1] = i;
      i = ppl;
      ppl = ppr;
      ppr = i;
      
      left="r";
      right="l";
      
    }
  
  for (i=0; i < files[0].orig.length; i++)
    {
      j=k;
      if (j >= files[1].orig.length) 
	{
	  files[1].orig = files[1].orig.concat("");
	  files[1].status[i] = "a"+left; // Added for left
	  files[0].status[i] = "m"+right; // missing in right
	  j++;
	  continue;
	}
      
      for ( ; j < files[1].orig.length; j++)
	{
	  if (files[0].orig[i] == files[1].orig[j]) {
						
	    matched = 1;
	    
	    if (i != j)
	      {
		
		p = j-i;
		for (; p > 0 ; p-- )
		  {
		    var slice_pre;
		    var slice_post;
		    slice_pre  = files[0].orig.slice(0,i);
		    slice_post = files[0].orig.slice(i,files[0].orig.length);
		    files[0].orig = slice_pre.concat("",slice_post);
		    files[0].status[i]="a"+right; // Added for right
		    files[1].status[i]="m"+left; // Missing in left
		    i++;
		  }
		
	      }
	    k=j+1;
	    
	    files[0].status[i] = "n"+right;  // normal with right
	    files[1].status[i] = "n"+left; // normal with left
	    
	    break;
	  }
	  else if (1 == match_percentage(files[0].orig[i],files[1].orig[j],s1,s2))
	    {
	      matched = 1;
	      
	      if (i != j)
		{
		  p = j-i;
		  for (; p > 0 ; p-- )
		    {
		      var slice_pre;
		      var slice_post;
		      slice_pre  = files[0].orig.slice(0,i);
		      slice_post = files[0].orig.slice(i,files[0].orig.length);
		      files[0].orig = slice_pre.concat("",slice_post);
		      files[0].status[i]="a"+right; // Added for right
		      files[1].status[i]="m"+left; // Missing in left
		      i++;
		    }
		  
		}
	      k=j+1;
	      //files[0].status[i]="partm"+right; // partial match right
	      //files[1].status[i]="partm"+left; // partial match left
	      files[0].status[i]=s1; // partial match right
	      files[1].status[i]=s2; // partial match left
	      s1 = new Array();
	      s2 = new Array();
	      break;
	    }
	  
	}
      
      if (matched == 1) 
	{
	  matched = 0;
	}
      else
	{
	  var slice_pre;
	  var slice_post;
	  slice_pre  = files[1].orig.slice(0,i);
	  slice_post = files[1].orig.slice(i,files[1].orig.length);
	  files[1].orig = slice_pre.concat("",slice_post);
	  files[1].status[i]="a"+left; // Added for left
	  files[0].status[i]="m"+right; // Missing in right
	  k++;
	}
    }
  
  ppl.innerHTML = "";
  ppr.innerHTML = "";
  
  formated_print(ppl,ppr,files[0],files[1]);
  
  document.getElementById('editor1').style.display = 'none';
  document.getElementById('editor2').style.display = 'none';
  document.getElementById('editor3').style.display = 'none';
  document.getElementById('editor_pp1').style.display = 'block';
  document.getElementById('editor_pp2').style.display = 'block';
  //          document.getElementById('editor_pp3').style.display = 'block';
}

function format_string(c,i) 
{
  var k=0;
  switch(c.status[i])
    {
    case "nr":
    case "nl":
      c.formated[i] = "<span class=\"unmodifed_line\">"+c.orig[i]+"</span><br />";
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

function formated_print(l1,l2,c1,c2)
{
  var i;
  for (i=0; i < c1.orig.length; i++)
    {
      format_string(c1,i);
      format_string(c2,i);
      l1.innerHTML = l1.innerHTML+c1.formated[i];
      l2.innerHTML = l2.innerHTML+c2.formated[i];
    }
}

var ref1=document.getElementById('editor1'),
  ref2=document.getElementById('editor2'),
  ref3=document.getElementById('editor3');
var vPos1=ref1.scrollTop,
  vPos2=ref2.scrollTop,
  vPos3=ref3.scrollTop;

function scrollsync() {
  if(ref1.scrollTop!=vPos1) {
    vPos1=ref3.scrollTop=ref2.scrollTop=ref1.scrollTop;
  }
  
  else if(ref2.scrollTop!=vPos2) {
    vPos2=ref3.scrollTop=ref1.scrollTop=ref2.scrollTop;
  }
  
  else if (ref3.scrollTop!=vPos3) {
    vPos3=ref1.scrollTop=ref2.scrollTop=ref3.scrollTop;
  }
  setTimeout('scrollsync()',1500)
    
    }


window.onload=scrollsync;
window.onload=reset_stuff;
