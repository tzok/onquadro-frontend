using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using RNAqbase.Models;
using RNAqbase.Repository;

namespace RNAqbase.Services
{
	public class HelixService : IHelixService
	{
		private readonly IHelixRepository helixRepository;
		private readonly IMemoryCache cache;
		private static readonly MemoryCacheEntryOptions Cache = new MemoryCacheEntryOptions
		{
			AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12)
		};


		public HelixService(IHelixRepository helixRepository, IMemoryCache cache)
		{
			this.helixRepository = helixRepository;
			this.cache = cache;
		}
		public async Task<List<HelixTable>> GetAllHelices()
		{
			if (!cache.TryGetValue(nameof(GetAllHelices), out List<HelixTable> result))
			{
				result = await helixRepository.GetAllHelices();

				cache.Set(nameof(GetAllHelices), result, Cache);
			}

			return result;
		}
		
        public async Task<HelixReference> GetHelixReferenceById(int id)
        {
            if (!cache.TryGetValue($"{nameof(GetAllHelices)}_{id}", out HelixReference result))
            {
                result = await helixRepository.GetHelixReferenceById(id);

                cache.Set($"{nameof(GetAllHelices)}_{id}", result, Cache);
            }

            return result;
        }
        public async  Task<MemoryStream> GetHelix3dVisualization(int id) =>
	        (await helixRepository.GetHelix3dVisualization(id));
        
        public async Task<IEnumerable<NucleotidesChiValues>> GetNucleotideChiValues(int id) =>
	        (await helixRepository.GetNucleotideChiValues(id)).ToList();

        public async Task<IEnumerable<HelixSummary>> GetHelixSummariesByPdbId(int pdbId) =>
	        await helixRepository.GetHelixSummariesByPdbId(pdbId);

    }

}
