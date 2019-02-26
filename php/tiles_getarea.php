<?php
############################################################
# tiles_getarea.php
############################################################
/*
part of TILES

respond to AJAX request
access the DB and send area data to client

*/
############################################################
# CREATED:	2015 feb 5
############################################################

// includes
require_once( './tiles_functions.php' );
require_once( './tiles_dblogin.php' );

if (isset($_POST['area']))
{
  $areaID = SanitizeString($_POST['area']);

  $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);
  if ($conn->connect_error)
  {
    die($conn->connect_error);
  }
  else
  {
    header('Content-Type: application/json');


  }
}
?>
