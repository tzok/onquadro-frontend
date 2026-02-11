using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RNAqbase.Services;

namespace RNAqbase.Controllers
{
	[Route("api/[controller]")]
	public class HelixController : Controller
	{
		private readonly IHelixService helixService;

		public HelixController(IHelixService helixService)
		{
			this.helixService = helixService;
		}

		[HttpGet("[action]")]
		public async Task<IActionResult> GetHelices()
		{
            return Ok(await helixService.GetAllHelices());
		}


        [HttpGet("[action]")]
        public async Task<IActionResult> GetHelixReferenceById(int id)
        {
            if (id == 0) return BadRequest();

            return Ok(await helixService.GetHelixReferenceById(id));
        }
        
        [HttpGet("[action]")]
        public async Task<IActionResult> GetHelix3dVisualizationMethod(int id)
        {
	        var dataStream = await helixService.GetHelix3dVisualization(id);
	        return File(dataStream,  "application/octet-stream", $"{id}.cif");
        }
        
        [HttpGet("[action]")]
        public async Task<IActionResult> GetNucleotideChiValues(int id)
        {
	        return Ok(await helixService.GetNucleotideChiValues(id));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetHelixSummariesByPdbId(int pdbId)
        {
            return Ok(await helixService.GetHelixSummariesByPdbId(pdbId));
        }
    }
}
