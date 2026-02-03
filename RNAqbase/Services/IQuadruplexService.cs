using RNAqbase.Models;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace RNAqbase.Services
{
	public interface IQuadruplexService
	{
		Task<List<QuadruplexTable>> GetAllQuadruplexes();
		Task<List<Structure>> GetAllStructures();
		Task<Quadruplex> GetQuadruplexById(int id);
		Task<List<int>> GetQuadruplexesByPdbId(int pdbId, int quadruplexId);
		Task<List<QuadruplexSummary>> GetQuadruplexSummariesByPdbId(int pdbId);
        Task<IEnumerable<Quadruplex>> FindAllQuadruplexInTheHelix(int id);
        Task<MemoryStream> GetQuadruplex3dVisualization(int quadruplexId);
        Task<IEnumerable<NucleotidesChiValues>> GetNucleotideChiValues(int id);
        Task<IEnumerable<QuadruplexLoops>> GetQuadruplexLoops(int id);
        Task<IEnumerable<Ions>> GetIons(int id);
	}
}
