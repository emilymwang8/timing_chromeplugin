-- MySQL dump 10.13  Distrib 5.5.29, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: chromeplugin
-- ------------------------------------------------------
-- Server version	5.5.29-0ubuntu0.12.04.2

 preunload,dns,connecttime,wait,req,resp,dom,loadEvent
-- Table structure for table `spidertable`
--

DROP TABLE IF EXISTS `performancetest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `performancetest` (
  `ip` int(10)  NOT NULL AUTO_INCREMENT,
  `url` varchar(50) DEFAULT NULL,
  `preunload` float(10,2) DEFAULT NULL,
  `dns` float(10,2) DEFAULT NULL,
  `connecttime` float(10,2) DEFAULT NULL,
  `wait` float(10,2) DEFAULT NULL,
  `req` float(10,2) DEFAULT NULL,
  `resp` float(10,2) DEFAULT NULL,
  `dom` float(10,2) DEFAULT NULL,
  `loadEvent` float(10,2) DEFAULT NULL,
  `operatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ip`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `spidertable`
--

LOCK TABLES `performancetest` WRITE;
/*!40000 ALTER TABLE `performancetest` DISABLE KEYS */;
INSERT INTO `performancetest` VALUES (1,'http://touch.anjuke.com',0,1,2,3,4,5,6,7,'2013-05-21 06:14:15'),(2,'http://touch.anjuke.com/cs',0,1,2,3,4,5,6,7,'2013-05-21 06:14:15');
/*!40000 ALTER TABLE `performancetest` ENABLE KEYS */;
UNLOCK TABLES;
