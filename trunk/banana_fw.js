var banana_timer = window.setTimeout('activity_tracker()',1000);
var banana_state = "NOT_EATING";
var banana_basket = new Array;

var used_banana = 0;
var banana_total;

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
