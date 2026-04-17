using RNAqbase.Models;
using RNAqbase.Models.Search;
using RNAqbase.Repository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text;

namespace RNAqbase.Services
{
public class SearchService : ISearchService
    {
        private readonly ISearchRepository searchRepository;
        private static readonly string BaseQuery = @"
SELECT
 MAX(q.id) AS Id,
 MAX(q.public_id) AS Public_id,
 q.loop_class as LoopTopology,
 STRING_AGG(DISTINCT(qg.gba_quadruplex_class)::text,', ') AS TetradCombination,
 CONCAT(MAX(q.onzm), MAX(q.subtype)) AS OnzmClass,
 to_char(MAX(p.release_date)::date, 'YYYY-MM-DD') as PdbDeposition,
 MAX(p.identifier) AS PdbId,
 MAX(p.public_id) AS Pdb_public_id,
 string_agg(DISTINCT(ion.name)::text, ', ') as Ion,
 string_agg(DISTINCT(ion.charge)::text, ', ') as Ion_charge,  
 MAX(p.assembly) AS AssemblyId,
 MAX(q_view.molecule) AS Molecule,
 MAX(p.experiment) AS Experiment,
 STRING_AGG(COALESCE((n1.short_name)||(n2.short_name)||(n3.short_name)||(n4.short_name), ''), '') AS Sequence,
 COUNT(DISTINCT SUBSTRING(t.onz::TEXT FROM 1 FOR 1)) AS TypeCount,
 COUNT(DISTINCT(t.id)) AS NumberOfTetrads,
 MAX(p.experiment) AS experiment,
 CASE
		WHEN max(q_view.chains) = 1 THEN 'unimolecular'
		WHEN max(q_view.chains) = 2 THEN  'bimolecular'
		ELSE 'tetramolecular'
	END 
 as TypeOfStrands
FROM QUADRUPLEX q
JOIN QUADRUPLEX_GBA qg on qg.quadruplex_id = q.id
JOIN TETRAD t ON q.id = t.quadruplex_id
JOIN QUADRUPLEX_VIEW q_view ON q.id = q_view.id
JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
JOIN NUCLEOTIDE n2 ON t.nt2_id = n2.id
JOIN NUCLEOTIDE n3 ON t.nt3_id = n3.id
JOIN NUCLEOTIDE n4 ON t.nt4_id = n4.id
JOIN PDB p ON n1.pdb_id = p.id
LEFT JOIN pdb_ion ON p.id = pdb_ion.pdb_id
LEFT JOIN ion ON ion.id = pdb_ion.ion_id
LEFT JOIN citation ON citation.pdb_id = p.id
LEFT JOIN citation_author author ON author.citation_id = citation.id
";

        public SearchService(ISearchRepository searchRepository)
        {
            this.searchRepository = searchRepository;
        }

        public async Task<List<QuadruplexTable>> GetAllResults(List<Filter> filters)
        {
            var parameterDictionary = new Dictionary<string, object>();
            if (filters == null || filters.Count == 0)
            {
                return await searchRepository.GetAllResults($"{BaseQuery}GROUP BY q.id HAVING (COUNT(t.id) > 1)", parameterDictionary);
            }

            foreach (Filter filter in filters)
            {
                filter.ParameterDictionary = parameterDictionary;
            }

            StringBuilder querySB = new StringBuilder(BaseQuery);
            bool isFirst = true;
            StringBuilder queryToHavingSB = new StringBuilder("");

            foreach (Filter filter in filters)
            {
                string queryFilter = filter.JoinConditions();
                if (queryFilter == "")
                {
                    continue;
                }

                if (filter.joinType == JoinType.Having)
                {
                    queryToHavingSB.Append($" AND {queryFilter}");
                }
                else
                {
                    if (isFirst)
                    {
                        querySB.Append($"WHERE {queryFilter} ");
                        isFirst = false;
                    }
                    else
                    {
                        querySB.Append($"AND {queryFilter} ");
                    }
                }
            }

            string query = $"{querySB.ToString()}GROUP BY q.id HAVING (COUNT(t.id) > 1){queryToHavingSB.ToString()};";
            return await searchRepository.GetAllResults(query, parameterDictionary);
        }

        public async Task<List<string>> GetExperimentalMethod() =>
            await searchRepository.GetExperimentalMethod();

        public async Task<List<string>> GetONZ() =>
            await searchRepository.GetONZ();

        public async Task<List<string>> GetIons() =>
            await searchRepository.GetIons();
            
        public async Task<List<string>> GetMoleculeType() =>
            await searchRepository.GetMoleculeType();

        public async Task<List<string>> GetWebbaDaSilva() =>
           await searchRepository.GetWebbaDaSilva();
    }
}
