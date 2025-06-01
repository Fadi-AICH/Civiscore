"""convert_primary_keys_to_uuid

Revision ID: 0d3105b23f4e
Revises: 603dc0dad552
Create Date: 2025-06-01 17:17:58.979522

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql
from app.models.utils import UUID


# revision identifiers, used by Alembic.
revision = '0d3105b23f4e'
down_revision = '603dc0dad552'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Conversion des clés primaires et étrangères en UUID
    
    # Users
    op.alter_column('users', 'id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=False)
    op.alter_column('users', 'role',
               existing_type=mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=50),
               type_=sa.Enum('admin', 'user', name='userrole'),
               nullable=False)
    
    # Countries
    op.alter_column('countries', 'id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=False)
    
    # Services
    op.alter_column('services', 'id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=False)
    op.alter_column('services', 'country_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               nullable=False)
    op.create_foreign_key('fk_services_country_id', 'services', 'countries', ['country_id'], ['id'], ondelete='CASCADE')
    
    # Evaluations
    op.alter_column('evaluations', 'id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=False)
    op.alter_column('evaluations', 'user_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               nullable=False)
    op.alter_column('evaluations', 'service_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               nullable=False)
    op.create_foreign_key('fk_evaluations_user_id', 'evaluations', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_evaluations_service_id', 'evaluations', 'services', ['service_id'], ['id'], ondelete='CASCADE')
    
    # Evaluation Criteria
    op.alter_column('evaluation_criteria', 'id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=False)
    
    # Evaluation Criteria Scores
    op.alter_column('evaluation_criteria_scores', 'id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=False)
    op.alter_column('evaluation_criteria_scores', 'evaluation_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               nullable=False)
    op.alter_column('evaluation_criteria_scores', 'criteria_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               nullable=False)
    op.create_foreign_key('fk_ecs_evaluation_id', 'evaluation_criteria_scores', 'evaluations', ['evaluation_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_ecs_criteria_id', 'evaluation_criteria_scores', 'evaluation_criteria', ['criteria_id'], ['id'], ondelete='CASCADE')
    
    # Evaluation Reports
    op.alter_column('evaluation_reports', 'id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=False)
    op.alter_column('evaluation_reports', 'evaluation_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               nullable=False)
    op.alter_column('evaluation_reports', 'reporter_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=True)
    op.alter_column('evaluation_reports', 'resolved',
               existing_type=mysql.INTEGER(),
               type_=sa.Boolean(),
               existing_nullable=True)
    op.create_foreign_key('fk_er_evaluation_id', 'evaluation_reports', 'evaluations', ['evaluation_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_er_reporter_id', 'evaluation_reports', 'users', ['reporter_id'], ['id'], ondelete='SET NULL')
    
    # Evaluation Votes
    op.alter_column('evaluation_votes', 'id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=False)
    op.alter_column('evaluation_votes', 'evaluation_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               nullable=False)
    op.alter_column('evaluation_votes', 'voter_id',
               existing_type=mysql.INTEGER(),
               type_=UUID(length=36),
               existing_nullable=True)
    op.create_foreign_key('fk_ev_evaluation_id', 'evaluation_votes', 'evaluations', ['evaluation_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key('fk_ev_voter_id', 'evaluation_votes', 'users', ['voter_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    # Suppression des contraintes de clé étrangère
    op.drop_constraint('fk_ev_voter_id', 'evaluation_votes', type_='foreignkey')
    op.drop_constraint('fk_ev_evaluation_id', 'evaluation_votes', type_='foreignkey')
    op.drop_constraint('fk_er_reporter_id', 'evaluation_reports', type_='foreignkey')
    op.drop_constraint('fk_er_evaluation_id', 'evaluation_reports', type_='foreignkey')
    op.drop_constraint('fk_ecs_criteria_id', 'evaluation_criteria_scores', type_='foreignkey')
    op.drop_constraint('fk_ecs_evaluation_id', 'evaluation_criteria_scores', type_='foreignkey')
    op.drop_constraint('fk_evaluations_service_id', 'evaluations', type_='foreignkey')
    op.drop_constraint('fk_evaluations_user_id', 'evaluations', type_='foreignkey')
    op.drop_constraint('fk_services_country_id', 'services', type_='foreignkey')
    
    # Reconversion des types UUID en INTEGER
    
    # Evaluation Votes
    op.alter_column('evaluation_votes', 'voter_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=True)
    op.alter_column('evaluation_votes', 'evaluation_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               nullable=True)
    op.alter_column('evaluation_votes', 'id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=False)
    
    # Evaluation Reports
    op.alter_column('evaluation_reports', 'resolved',
               existing_type=sa.Boolean(),
               type_=mysql.INTEGER(),
               existing_nullable=True)
    op.alter_column('evaluation_reports', 'reporter_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=True)
    op.alter_column('evaluation_reports', 'evaluation_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               nullable=True)
    op.alter_column('evaluation_reports', 'id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=False)
    
    # Evaluation Criteria Scores
    op.alter_column('evaluation_criteria_scores', 'criteria_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               nullable=True)
    op.alter_column('evaluation_criteria_scores', 'evaluation_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               nullable=True)
    op.alter_column('evaluation_criteria_scores', 'id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=False)
    
    # Evaluation Criteria
    op.alter_column('evaluation_criteria', 'id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=False)
    
    # Evaluations
    op.alter_column('evaluations', 'service_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               nullable=True)
    op.alter_column('evaluations', 'user_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               nullable=True)
    op.alter_column('evaluations', 'id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=False)
    
    # Services
    op.alter_column('services', 'country_id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               nullable=True)
    op.alter_column('services', 'id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=False)
    
    # Countries
    op.alter_column('countries', 'id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=False)
    
    # Users
    op.alter_column('users', 'role',
               existing_type=sa.Enum('admin', 'user', name='userrole'),
               type_=mysql.VARCHAR(collation='utf8mb4_unicode_ci', length=50),
               nullable=True)
    op.alter_column('users', 'id',
               existing_type=UUID(length=36),
               type_=mysql.INTEGER(),
               existing_nullable=False)
