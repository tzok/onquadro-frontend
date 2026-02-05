using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Configuration;
using RNAqbase.Models;

namespace RNAqbase.Repository
{
	public class StatisticsRepository : RepositoryBase, IStatisticsRepository
	{
		public StatisticsRepository(IConfiguration configuration) : base(configuration)
		{
		}

		public async Task<List<Statistics>> GetTopologyBaseTetradViewTableOne()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"
					SELECT
					(select string_agg(a, '') 
					from (
					  select unnest(regexp_split_to_array(sequence, '')) as a 
					  order by a) s) as sequence,
					SUM(CASE tv.molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
					SUM(CASE tv.molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
					SUM(CASE tv.molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
					COUNT(*) AS Total
					FROM tetrad_view tv
					JOIN quadruplex_view qv on tv.quadruplex_id = qv.id
					WHERE qv.count > 1
					GROUP BY (select string_agg(a, '') 
					from (
					  select unnest(regexp_split_to_array(sequence, '')) as a 
					  order by a) s)
					UNION ALL
					SELECT 'Total',
					SUM(CASE tv.molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
					SUM(CASE tv.molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
					SUM(CASE tv.molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
					COUNT(*) AS Total
					FROM tetrad_view tv
					JOIN quadruplex_view qv on tv.quadruplex_id = qv.id
					WHERE qv.count > 1;")).ToList();
			}
		}

		public async Task<List<Statistics>> GetTopologyBaseQuadruplexViewTableTwo()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"
					SELECT CAST(count AS text) AS NumberOfTetrads,
					SUM(CASE molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
					SUM(CASE molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
					SUM(CASE molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
					COUNT(*) AS Total
					FROM quadruplex_view
					GROUP BY count
					UNION ALL
					SELECT 'Total',
					SUM(CASE molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
					SUM(CASE molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
					SUM(CASE molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
					COUNT(*) AS Total
					FROM quadruplex_view;")).ToList();
			}
		}

		public async Task<List<Statistics>> GetTopologyBaseQuadruplexViewTableThere()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"
				SELECT CAST(chains AS text),
				SUM(CASE molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
				SUM(CASE molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
				SUM(CASE molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
				COUNT(*) AS Total
				FROM quadruplex_view
				GROUP BY chains
				UNION ALL
				SELECT 'Total',
				SUM(CASE molecule WHEN 'DNA' THEN 1 ELSE 0 END) AS DNA,
				SUM(CASE molecule WHEN 'RNA' THEN 1 ELSE 0 END) AS RNA,
				SUM(CASE molecule WHEN 'Other' THEN 1 ELSE 0 END) AS Other,
				COUNT(*) AS Total
				FROM quadruplex_view;")).ToList();
			}
		}

		public async Task<List<Statistics>> GetElTetradoTetradViewTableOne()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"
SELECT CAST(onz AS text),
SUM(CASE tv.chains WHEN 1 THEN 1 ELSE 0 END) AS Unimolecular,
SUM(CASE tv.chains WHEN 2 THEN 1 ELSE 0 END) AS Bimolecular,
SUM(CASE tv.chains WHEN 4 THEN 1 ELSE 0 END) AS Tetramolecular,
COUNT(*) AS Total
FROM tetrad_view tv
JOIN quadruplex_view qv on tv.quadruplex_id = qv.id
WHERE qv.count > 1
GROUP BY onz
UNION ALL
SELECT 'Total',
SUM(CASE tv.chains WHEN 1 THEN 1 ELSE 0 END) AS Unimolecular,
SUM(CASE tv.chains WHEN 2 THEN 1 ELSE 0 END) AS Bimolecular,
SUM(CASE tv.chains WHEN 4 THEN 1 ELSE 0 END) AS Tetramolecular,
COUNT(*) AS Total
FROM tetrad_view tv
JOIN quadruplex_view qv on tv.quadruplex_id = qv.id
WHERE qv.count > 1;")).ToList();
			}
		}

		public async Task<List<Statistics>> GetElTetradoQuadruplexViewTableTwo()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"
SELECT CAST(onzm AS text),
SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
COUNT(*) AS Total
FROM quadruplex_view
WHERE chains = 1
GROUP BY onzm
UNION ALL
SELECT 'Total',
SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
COUNT(*) AS Total
FROM quadruplex_view
WHERE chains = 1;")).ToList();
			}
		}

		public async Task<List<Statistics>> GetElTetradoQuadruplexViewTableThereA()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"
SELECT CAST(onzm AS text),
SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
COUNT(*) AS Total
FROM quadruplex_view
WHERE chains = 2
GROUP BY onzm
UNION ALL
SELECT 'Total',
SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
COUNT(*) AS Total
FROM quadruplex_view
WHERE chains = 2;")).ToList();
			}
		}

		public async Task<List<Statistics>> GetElTetradoQuadruplexViewTableThereB()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"
SELECT CAST(onzm AS text),
SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
COUNT(*) AS Total
FROM quadruplex_view
WHERE chains = 4
GROUP BY onzm
UNION ALL
SELECT 'Total',
SUM(CASE subtype WHEN '+' THEN 1 ELSE 0 END) AS Plus,
SUM(CASE subtype WHEN '-' THEN 1 ELSE 0 END) AS Minus,
SUM(CASE subtype WHEN '*' THEN 1 ELSE 0 END) AS Star,
COUNT(*) AS Total
FROM quadruplex_view
WHERE chains = 4;")).ToList();
			}
		}
		
		
		public async Task<HomePagePlot> GetCountOfComponents()
		{		
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryFirstAsync<HomePagePlot>(
					@"select (select count(*) from quadruplex) as QuadruplexCount,
					   (select count(DISTINCT(helix_id)) from helix_quadruplex) as HelixCount,
					   (select count(*) from tetrad) as TetradCount, 
					   (select count(x) as StructureCount from
						(SELECT p.identifier
						FROM 
						QUADRUPLEX as q  
						JOIN TETRAD t ON q.id = t.quadruplex_id
						JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
						JOIN PDB p ON n1.pdb_id = p.id
						GROUP BY p.identifier, p.assembly) as x)"));
			}
		}

		
		public async Task<HomePagePlot> GetUpdateInformations()
		{			
			using (var connection = Connection)
			{
				connection.Open();
				
				return (await connection.QueryFirstAsync<HomePagePlot>(
					@"select to_char(t.release_date::date, 'YYYY-MM-DD') as PdbRelease,
						COALESCE(numberOfTetrad,0) as AddedTetradCount,
						COALESCE(numberOfQuadruplex, 0) as AddedQuadruplexCount,
						COALESCE(numberOfHelix, 0) as AddedHelixCount,
					    COALESCE(numberOfStructure, 0) as AddedStructureCount
						from tetrad_growth_view t
						left join quadruplex_growth_view q  on t.release_date = q.release_date
						left join helix_growth_view h on t.release_date = h.release_date
						left join structure_growth_view s on t.release_date = s.release_date
						WHERE t.release_date = (select release_date from tetrad_growth_view order by release_date desc limit 1)
						"));
				
			}
		}
		
		public async Task<List<Statistics>> ion_distribution_o_plus()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT
						ion.name as Ion,
						count(*) as Total
					  FROM QUADRUPLEX q
					  JOIN TETRAD t ON q.id = t.quadruplex_id
					  JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
					  JOIN PDB p ON n1.pdb_id = p.id
					  JOIN pdb_ion ON p.id = pdb_ion.pdb_id
					  JOIN ion ON ion.id = pdb_ion.ion_id
					  where onz = 'O+'
					  GROUP BY ion
					  order by total;")).ToList();
			}
		}
		public async Task<List<Statistics>> ion_distribution_o_minus()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT
						ion.name as Ion,
						count(*) as Total
					  FROM QUADRUPLEX q
					  JOIN TETRAD t ON q.id = t.quadruplex_id
					  JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
					  JOIN PDB p ON n1.pdb_id = p.id
					  JOIN pdb_ion ON p.id = pdb_ion.pdb_id
					  JOIN ion ON ion.id = pdb_ion.ion_id
					  where onz = 'O-'
					  GROUP BY ion
					  order by total;")).ToList();
			}
		}
		public async Task<List<Statistics>> ion_distribution_n_plus()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT
						ion.name as Ion,
						count(*) as Total
					  FROM QUADRUPLEX q
					  JOIN TETRAD t ON q.id = t.quadruplex_id
					  JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
					  JOIN PDB p ON n1.pdb_id = p.id
					  JOIN pdb_ion ON p.id = pdb_ion.pdb_id
					  JOIN ion ON ion.id = pdb_ion.ion_id
					  where onz = 'N+'
					  GROUP BY ion
					  order by total;")).ToList();
			}
		}
		
		public async Task<List<Statistics>> ion_distribution_n_minus()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT
						ion.name as Ion,
						count(*) as Total
					  FROM QUADRUPLEX q
					  JOIN TETRAD t ON q.id = t.quadruplex_id
					  JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
					  JOIN PDB p ON n1.pdb_id = p.id
					  JOIN pdb_ion ON p.id = pdb_ion.pdb_id
					  JOIN ion ON ion.id = pdb_ion.ion_id
					  where onz = 'N-'
					  GROUP BY ion
					  order by total;")).ToList();
			}
		}
		
		public async Task<List<Statistics>> ion_distribution_z_plus()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT
						ion.name as Ion,
						count(*) as Total
					  FROM QUADRUPLEX q
					  JOIN TETRAD t ON q.id = t.quadruplex_id
					  JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
					  JOIN PDB p ON n1.pdb_id = p.id
					  JOIN pdb_ion ON p.id = pdb_ion.pdb_id
					  JOIN ion ON ion.id = pdb_ion.ion_id
					  where onz = 'Z+'
					  GROUP BY ion
					  order by total;")).ToList();
			}
		}
		public async Task<List<Statistics>> ion_distribution_z_minus()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT
						ion.name as Ion,
						count(*) as Total
					  FROM QUADRUPLEX q
					  JOIN TETRAD t ON q.id = t.quadruplex_id
					  JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
					  JOIN PDB p ON n1.pdb_id = p.id
					  JOIN pdb_ion ON p.id = pdb_ion.pdb_id
					  JOIN ion ON ion.id = pdb_ion.ion_id
					  where onz = 'Z-'
					  GROUP BY ion
					  order by total;")).ToList();
			}
		}

		public async Task<List<Statistics>> gba_da_silva()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"select count(*) as Total, s1.TetradCombination as gba_class 
						  from (SELECT
  							STRING_AGG(DISTINCT(qg.gba_quadruplex_class)::text,', ') AS TetradCombination
						  FROM QUADRUPLEX q
						  JOIN QUADRUPLEX_GBA qg on qg.quadruplex_id = q.id
						  group by q.id) as s1
						  group by s1.TetradCombination;")).ToList();
			}
		}
		public async Task<List<Statistics>> loop_da_silva()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT
							count(*) as Total,
							loop_class
						FROM quadruplex 
						where loop_class IS NOT NULL
						group by loop_class
						UNION
						SELECT
							count(*) as Total,
							q.loop_class as loop_class
						FROM QUADRUPLEX q
						JOIN QUADRUPLEX_VIEW q_view ON q.id = q_view.id
						where q.loop_class IS NULL and q_view.chains in ('1')
						GROUP BY q.loop_class, q_view.chains;")).ToList();
			}
		}
		public async Task<List<Statistics>> experimental_method()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT DISTINCT experiment AS experimental_method, COUNT(*) as Total FROM PDB GROUP BY experiment;")).ToList();
			}
		}
		public async Task<List<Statistics>> loop_progression_da_silva()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT DISTINCT q.loop_progression AS loop_progression_da_silva, COUNT(*) as Total
							FROM tetrad t
							JOIN quadruplex q on q.id = t.quadruplex_id
							WHERE q.loop_progression IS NOT NULL
							GROUP BY loop_progression;")).ToList();
			}
		}
		public async Task<List<Statistics>> onzm()
		{			
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<Statistics>(
					@"SELECT DISTINCT CASE 
							WHEN SUBSTRING(onzm::TEXT, 2, 1) = 'a' THEN 'antiparallel'
							WHEN SUBSTRING(onzm::TEXT, 2, 1) = 'p' THEN 'parallel'
							ELSE 'hybrid' END AS onzm,
							COUNT(*) as Total FROM quadruplex GROUP BY SUBSTRING(onzm::TEXT, 2, 1);")).ToList();
			}
		}
	}
}
