using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RNAqbase.Repository;

namespace RNAqbase.Controllers
{
    [Route("api/[controller]")]
    public class TetradController : Controller
    {
        private readonly ITetradRepository repository;

        public TetradController(ITetradRepository repository)
        {
            this.repository = repository;
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetTetradById(int id)
        {
	        if (id == 0) return BadRequest();

            return Ok(await repository.FindById(id));
        }
        
        [HttpGet("[action]")]
        public async Task<IActionResult>  GetTetradNucleotides(int id)
        {
            if (id == 0) return BadRequest();

            return Ok(await repository. GetTetradNucleotides(id));
        }
        
        [HttpGet("[action]")]
        public async Task<IActionResult> GetTetrads()
        {
            return Ok(await repository.FindAll());
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetOtherTetradsInTheSameQuadruplex(int tetradId, int quadruplexId)
        {
            if (tetradId == 0 || quadruplexId == 0) return BadRequest();

            return Ok(await repository.
	            GetOtherTetradsInTheSameQuadruplex(tetradId, quadruplexId));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetOtherTetradsInTheSamePdb(int tetradId, int pdbId)
        {
            if (tetradId == 0 || pdbId == 0) return BadRequest();

            return Ok(await repository.GetOtherTetradsInTheSamePdb(tetradId, pdbId));
        }

        [HttpGet("[action]")]
        public async Task <IActionResult> GetListOfTetrads(int id)
        {
            if(id == 0) return BadRequest();
            return Ok(await repository.FindAllTetradsInTheSameQuadruplex(id));
        }

        
        [HttpGet("[action]")]
        public async Task <IActionResult> GetListOfTetradsInHelix(int id)
        {
            if(id == 0) return BadRequest();
            return Ok(await repository.FindAllTetradsInTheSameHelix(id));
        }

        [HttpGet("[action]")]
        public async Task<IActionResult> GetTetradSummariesByPdbId(int pdbId)
        {
            if (pdbId == 0) return BadRequest();
            return Ok(await repository.GetTetradSummariesByPdbId(pdbId));
        }

        
        [HttpGet("[action]")]
        public async Task<IActionResult> GetCifFile(int tetradId)
        {
            var dataStream = await repository.GetTetrad3dVisualization(tetradId);
	        
	        return File(dataStream, "application/octet-stream", $"{tetradId}.cif");
        }
        
        		
        [HttpGet("[action]")]
        public async Task<IActionResult> GetIons(int id)
        {
            return Ok(await repository.GetIons(id));
        }

    }
}
