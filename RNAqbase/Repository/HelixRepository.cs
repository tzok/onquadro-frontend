using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Microsoft.Extensions.Configuration;
using RNAqbase.Models;

namespace RNAqbase.Repository
{
	public class HelixRepository : RepositoryBase, IHelixRepository
	{
		public HelixRepository(IConfiguration configuration) : base(configuration)
		{
		}

		public async Task<HelixReference> GetHelixReferenceById(int id)
		{
			using (var connection = Connection)
			{
				connection.Open();

				var helix = await connection.QueryFirstAsync<HelixReference>(
						(@"
                        SELECT DISTINCT ON(h.id)
						h.id AS Id,     
						h.public_id AS Public_id,
						h.basename AS Basename,
						h.dot_bracket AS Dot_bracket,
						p.identifier AS PdbIdentifier,
						MAX(p.id) AS PdbId,
						MAX(p.public_id) AS Pdb_public_id,
                        p.title AS Title,
						to_char(MAX(p.release_date)::date, 'YYYY-MM-DD') as PdbDeposition,
						p.assembly AS AssemblyId,
						max(q_view.molecule) AS Molecule,
						STRING_AGG(COALESCE((n1.short_name)||(n2.short_name)||(n3.short_name)||(n4.short_name), ''), '') AS Sequence,
						COUNT(t.id) AS NumberOfTetrads,
						p.experiment AS Experiment,
						COUNT(DISTINCT(q.id)) AS NumberOfQuadruplexes,
						 CASE
								WHEN max(q_view.chains) = 1 THEN 'unimolecular'
								WHEN max(q_view.chains) = 2 THEN  'bimolecular'
								ELSE 'tetramolecular'
						 END 
						 as TypeOfStrands
					FROM HELIX h
					JOIN HELIX_QUADRUPLEX hq on h.id = hq.helix_id
					JOIN QUADRUPLEX q on hq.quadruplex_id = q.id
					JOIN QUADRUPLEX_VIEW q_view on q.id = q_view.id
					JOIN TETRAD t ON q.id = t.quadruplex_id
					JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
					JOIN NUCLEOTIDE n2 ON t.nt2_id = n2.id
					JOIN NUCLEOTIDE n3 ON t.nt3_id = n3.id
					JOIN NUCLEOTIDE n4 ON t.nt4_id = n4.id
					JOIN PDB p ON n1.pdb_id = p.id
					where h.id = @HelixId
					GROUP BY h.id, p.identifier, n1.pdb_id, p.assembly, p.title, n1.molecule, p.experiment"),
						new { HelixId = id });

				return helix;
			}
		}

		public async Task<IEnumerable<NucleotidesChiValues>> GetNucleotideChiValues(int id)
		{
			using (var connection = Connection)
			{
				connection.Open();

				return await connection.QueryAsync<NucleotidesChiValues>(
						(@"
						SELECT t.id as tetrad_id,
						t.public_id as tetrad_public_id,
						n1.chi as n1_chi, 
						n2.chi as n2_chi, 
						n3.chi as n3_chi,
						n4.chi as n4_chi,
						n1.glycosidic_bond as n1_glycosidic_bond,
						n2.glycosidic_bond as n2_glycosidic_bond,
						n3.glycosidic_bond as n3_glycosidic_bond,
						n4.glycosidic_bond as n4_glycosidic_bond
						FROM helix_quadruplex hq
						JOIN tetrad t on t.quadruplex_id = hq.quadruplex_id
						JOIN nucleotide n1 on t.nt1_id = n1.id
						JOIN nucleotide n2 on t.nt2_id = n2.id
						JOIN nucleotide n3 on t.nt3_id = n3.id
						JOIN nucleotide n4 on t.nt4_id = n4.id
						WHERE hq.helix_id = @HelixId"),
						new { HelixId = id });
			}
		}

		public async Task<List<HelixTable>> GetAllHelices()
		{
			using (var connection = Connection)
			{
				connection.Open();

				return (await connection.QueryAsync<HelixTable>(
						@"SELECT DISTINCT ON(h.id)
							h.id AS Id,       
	    					h.public_id AS Public_id,
     						string_agg(DISTINCT(q.id)::text, ',') as QuadruplexesIds,
	    						string_agg(DISTINCT(q.public_id)::text, ',') as QuadruplexesPublicIds,
							p.identifier AS PdbId,
							MAX(p.public_id) AS Pdb_public_id,
							to_char(MAX(p.release_date)::date, 'YYYY-MM-DD') as PdbDeposition,
							p.assembly AS AssemblyId,
							max(q_view.molecule) AS Molecule,
    						max(p.experiment) AS Experiment,
							STRING_AGG(COALESCE((n1.short_name)||(n2.short_name)||(n3.short_name)||(n4.short_name), ''), '') AS Sequence,
							COUNT(t.id) AS NumberOfTetrads,
							p.experiment AS Experiment,
							COUNT(DISTINCT(q.id)) AS NumberOfQuadruplexes,
							 CASE
									WHEN max(q_view.chains) = 1 THEN 'unimolecular'
									WHEN max(q_view.chains) = 2 THEN  'bimolecular'
									ELSE 'tetramolecular'
							 END 
							 as TypeOfStrands
						FROM HELIX h
						JOIN HELIX_QUADRUPLEX hq on h.id = hq.helix_id
						JOIN QUADRUPLEX q on hq.quadruplex_id = q.id
						JOIN QUADRUPLEX_VIEW q_view on q.id = q_view.id
						JOIN TETRAD t ON q.id = t.quadruplex_id
						JOIN NUCLEOTIDE n1 ON t.nt1_id = n1.id
						JOIN NUCLEOTIDE n2 ON t.nt2_id = n2.id
						JOIN NUCLEOTIDE n3 ON t.nt3_id = n3.id
						JOIN NUCLEOTIDE n4 ON t.nt4_id = n4.id
						JOIN PDB p ON n1.pdb_id = p.id
						GROUP BY h.id, p.identifier, n1.pdb_id, p.assembly, n1.molecule, p.experiment
						order by h.id;
                        ")).ToList();
			}
		}

		public async Task<IEnumerable<HelixSummary>> GetHelixSummariesByPdbId(int pdbId)
		{
			using (var connection = Connection)
			{
				connection.Open();
				return await connection.QueryAsync<HelixSummary>
				(@"
					SELECT
						h.id AS Id,
						h.public_id AS Public_id,
						hq.quadruplex_id AS Quadruplex_id
					FROM helix h
						JOIN helix_quadruplex hq ON h.id = hq.helix_id
					WHERE h.pdb_id = @PdbId
					ORDER BY h.id, hq.quadruplex_id;",
					new { PdbId = pdbId });
			}
		}

		public async Task<MemoryStream> GetHelix3dVisualization(int helixId)
		{
			using (var connection = Connection)
			{
				connection.Open();
				var coordinates = await connection.QueryFirstAsync<string>
				(@" 
					SELECT coordinates
					FROM helix
					WHERE id = @id;",
						new { id = helixId });

				var stream = new MemoryStream();
				var writer = new StreamWriter(stream);
				writer.Write(coordinates);
				writer.Flush();
				stream.Position = 0;
				return stream;
			}
		}
	}
}
