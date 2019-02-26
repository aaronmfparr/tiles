TILES.requestArea = function requestArea(areaId)
{
  params = "area="+areaId;

  request = new TEST_AJAX.ajaxRequest();
  request.open("POST", "php/tiles_getarea.php", true);
  request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  request.setRequestHeader("Content-length", params.length);
  request.setRequestHeader("Connection", "close");
  request.onreadystatechange = TILES.loadArea();

  request.send(params);
}

TILES.loadArea = function loadArea()
{
  alert(this.readyState+"\n\n"+request.getAllResponseHeaders());

  if (this.readyState == 4)
  {
    if (this.status == 200)
    {
      if (this.responseText != null)
      {
        alert(this.responseText);
      }
      else
      {
        alert("Ajax error: No data received");
      }
    }
    else
    {
      alert( "Ajax error: " + this.statusText);
    }
  }
}
