using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using RNAqbase.Models;

namespace RNAqbase.Repository
{
	public interface ITetradRepository
	{
		Task<TetradDescription> FindById(int id);
		Task<TetradNucleotides> GetTetradNucleotides(int id);
		Task<IEnumerable<TetradTable>> FindAll();
		Task<IEnumerable<int>> GetOtherTetradsInTheSameQuadruplex(int tetradId, int quadruplexId);
		Task<IEnumerable<int>> GetOtherTetradsInTheSamePdb(int tetradId, int pdbId);
		Task<IEnumerable<TetradReference>> FindAllTetradsInTheSameQuadruplex(int id);
		Task<IEnumerable<TetradReference>> FindAllTetradsInTheSameHelix(int id);
		Task<IEnumerable<TetradSummary>> GetTetradSummariesByPdbId(int pdbId);
		Task<MemoryStream> GetTetrad3dVisualization(int tetradId);
		Task<IEnumerable<Ions_tetrad>> GetIons(int id);

	}
}
