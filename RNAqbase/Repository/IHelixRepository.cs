using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using RNAqbase.Models;

namespace RNAqbase.Repository
{
	public interface IHelixRepository
	{
		Task<List<HelixTable>> GetAllHelices();
        Task<HelixReference> GetHelixReferenceById(int id);
        Task<IEnumerable<NucleotidesChiValues>> GetNucleotideChiValues(int id);
        Task<MemoryStream> GetHelix3dVisualization(int id);
        Task<IEnumerable<HelixSummary>> GetHelixSummariesByPdbId(int pdbId);
    }
}
