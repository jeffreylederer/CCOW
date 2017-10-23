using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace CCOW.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult CCOWInit()
        {
            return View();
        }


        public ActionResult Main()
        {
           
            return View();
        }
    }
}